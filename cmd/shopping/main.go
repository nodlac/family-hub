package main

import (
 "database/sql"
 "fmt"
 "html/template"
 "log"
 "net/http"
 "os"
 "path/filepath"
 "strconv"
 "strings"
 "time"
 _ "modernc.org/sqlite"
)

type Item struct { ID int64; Name string; Quantity int; Done bool }
var page=template.Must(template.New("page").Parse(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Shopping</title><script src="https://unpkg.com/htmx.org@2.0.4/dist/htmx.min.js"></script><style>body{font:16px system-ui;background:#f6f7f9;color:#18212c;margin:0}main{max-width:560px;margin:4rem auto;padding:1.5rem;background:white;border-radius:16px;box-shadow:0 4px 24px #0001}h1{margin-top:0}form{display:flex;gap:.5rem}input{padding:.75rem;border:1px solid #ccd1d8;border-radius:8px;min-width:0;flex:1;font:inherit}button{border:0;border-radius:8px;padding:.7rem 1rem;background:#193b68;color:white;font:inherit;cursor:pointer}li{display:flex;align-items:center;gap:.6rem;padding:.65rem 0;border-bottom:1px solid #eee}li span{flex:1}li.done span{text-decoration:line-through;color:#777}.remove{background:#eee;color:#333}ul{list-style:none;padding:0} .qty{font-size:.85rem;color:#555}</style></head><body><main><h1>Shopping list</h1><form hx-post="/items" hx-target="#items" hx-swap="innerHTML"><input name="name" maxlength="160" placeholder="Add an item" aria-label="Item name" required autofocus><input name="quantity" type="number" min="1" max="999" value="1" aria-label="Quantity" style="max-width:65px"><button>Add</button></form><div id="items">{{template "items" .}}</div></main></body></html>`))
func init(){template.Must(page.New("items").Parse(`<ul>{{range .}}<li class="{{if .Done}}done{{end}}"><form hx-post="/items/{{.ID}}/toggle" hx-target="#items" hx-swap="innerHTML"><button aria-label="Toggle {{.Name}}">{{if .Done}}✓{{else}}○{{end}}</button></form><span>{{.Name}} {{if gt .Quantity 1}}<small class="qty">× {{.Quantity}}</small>{{end}}</span><form hx-post="/items/{{.ID}}/delete" hx-target="#items" hx-swap="innerHTML"><button class="remove" aria-label="Remove {{.Name}}">×</button></form></li>{{else}}<li>Nothing on your list yet.</li>{{end}}</ul>`))}
func main(){
 path:=os.Getenv("SHOPPING_DB");if path=="" {path="./data/shopping.db"}
 if err:=os.MkdirAll(filepath.Dir(path),0700);err!=nil {log.Fatal(err)}
 db,err:=sql.Open("sqlite",path);if err!=nil {log.Fatal(err)};defer db.Close()
 db.SetMaxOpenConns(1)
 if _,err=db.Exec("PRAGMA busy_timeout=5000; PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS items(id INTEGER PRIMARY KEY,name TEXT NOT NULL,quantity INTEGER NOT NULL DEFAULT 1 CHECK(quantity BETWEEN 1 AND 999),done INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)");err!=nil {log.Fatal(err)}
 items:=func()([]Item,error){rows,err:=db.Query("SELECT id,name,quantity,done FROM items ORDER BY done,id");if err!=nil{return nil,err};defer rows.Close();var out []Item;for rows.Next(){var i Item;if err=rows.Scan(&i.ID,&i.Name,&i.Quantity,&i.Done);err!=nil{return nil,err};out=append(out,i)};return out,rows.Err()}
 render:=func(w http.ResponseWriter,partial bool){list,err:=items();if err!=nil {http.Error(w,"database error",500);return};w.Header().Set("Content-Type","text/html; charset=utf-8");if partial {err=page.ExecuteTemplate(w,"items",list)}else{err=page.Execute(w,list)};if err!=nil{log.Print(err)}}
 mux:=http.NewServeMux()
 mux.HandleFunc("GET /healthz",func(w http.ResponseWriter,r *http.Request){if err:=db.Ping();err!=nil{http.Error(w,"unhealthy",503);return};fmt.Fprint(w,"ok")})
 mux.HandleFunc("GET /",func(w http.ResponseWriter,r *http.Request){if r.URL.Path!="/"{http.NotFound(w,r);return};render(w,false)})
 mux.HandleFunc("POST /items",func(w http.ResponseWriter,r *http.Request){if err:=r.ParseForm();err!=nil{http.Error(w,"bad form",400);return};name:=strings.TrimSpace(r.FormValue("name"));q,err:=strconv.Atoi(r.FormValue("quantity"));if name==""||len(name)>160||err!=nil||q<1||q>999{http.Error(w,"invalid item",400);return};if _,err=db.Exec("INSERT INTO items(name,quantity) VALUES(?,?)",name,q);err!=nil{http.Error(w,"database error",500);return};render(w,true)})
 mux.HandleFunc("POST /items/{id}/{action}",func(w http.ResponseWriter,r *http.Request){id,err:=strconv.ParseInt(r.PathValue("id"),10,64);if err!=nil||id<1{http.Error(w,"invalid id",400);return};var query string;switch r.PathValue("action"){case "toggle":query="UPDATE items SET done=1-done WHERE id=?";case "delete":query="DELETE FROM items WHERE id=?";default:http.NotFound(w,r);return};if _,err=db.Exec(query,id);err!=nil{http.Error(w,"database error",500);return};render(w,true)})
 // This service MUST be protected by reverse-proxy authentication before public exposure.
 // Origin verification adds defense in depth for browser form posts.
 handler:=http.HandlerFunc(func(w http.ResponseWriter,r *http.Request){if r.Method=="POST"{origin:=r.Header.Get("Origin");host:=r.Host;if origin!=""&&!strings.HasSuffix(origin,"://"+host){http.Error(w,"origin rejected",403);return}};mux.ServeHTTP(w,r)})
 addr:=os.Getenv("SHOPPING_ADDR");if addr==""{addr="127.0.0.1:8097"}
 server:=&http.Server{Addr:addr,Handler:handler,ReadHeaderTimeout:5*time.Second}
 log.Printf("shopping listening on %s",addr);log.Fatal(server.ListenAndServe())
}
