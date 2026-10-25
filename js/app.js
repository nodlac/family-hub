// Adventure Bucket List Data
const bucketListData = {
    family: [
        {
            id: 'segocanyon',
            title: 'Sego Canyon (Thompson Springs)',
            location: 'Thompson Springs, UT (~2h05m E of SLC)',
            season: 'Spring/Fall',
            time: 'Half Day',
            kidFriendly: true,
            obscure: '★★★★★',
            priority: 1,
            notes: 'Incredible rock art (Barrier Canyon style), old ghost town remnants, train history. Often empty. Feels like a secret.'
        },
        {
            id: 'littlewildhorse',
            title: 'Little Wild Horse Canyon/Bell Canyon Loop',
            location: 'San Rafael Swell (~2h45m from SLC)',
            season: 'Spring/Fall',
            time: 'Half/Full Day',
            kidFriendly: true,
            obscure: '★★★★★',
            priority: 1,
            notes: 'Way less known than Narrows. Family-friendly if you pick a short section. Check flash flood risk.'
        },
        {
            id: 'stansbury',
            title: 'Stansbury Island Hot Springs',
            location: 'Stansbury Island/Grantsville area (~45-75 min W)',
            season: 'Spring/Fall',
            time: 'Half Day',
            kidFriendly: 'Varies',
            obscure: '★★★★★',
            priority: 1,
            notes: 'Genuinely lesser-known to out-of-towners. Verify access/safety before going (conditions change).'
        },
        {
            id: 'boulder',
            title: 'Boulder Mountain / Thousand Lake Mountain',
            location: 'Boulder, UT (~3h45m)',
            season: 'Late Spring-Fall',
            time: 'Full Day',
            kidFriendly: true,
            obscure: '★★★★★',
            priority: 1,
            notes: 'High alpine lakes with almost no tourists. Scenic drive + short walks. Feels hidden.'
        },
        {
            id: 'goblin',
            title: 'Goblin Valley State Park',
            location: 'Hanksville area (~3h15m SE)',
            season: 'Spring/Fall',
            time: 'Full Day (or overnight)',
            kidFriendly: true,
            obscure: '★★★★☆',
            priority: 1,
            notes: 'Popular with Utahns but still flies under the radar nationally. Feels like a giant playground.'
        },
        {
            id: 'antelope',
            title: 'Antelope Island (off-trail/lesser stops)',
            location: 'Antelope Island SP (~40-60 min NW of SLC)',
            season: 'Spring/Fall',
            time: 'Half/Full Day',
            kidFriendly: true,
            obscure: '★★★★☆',
            priority: 1,
            notes: 'Skip the beach crowds and explore the north end or backroads - great bison sightings with fewer people.'
        },
        {
            id: 'bonneville',
            title: 'Bonneville Salt Flats',
            location: 'Wendover, UT (~1h45m W of SLC)',
            season: 'Spring/Fall (avoid summer heat)',
            time: 'Half/Full Day',
            kidFriendly: true,
            obscure: '★★★★☆',
            priority: 1,
            notes: 'Known regionally but not on most family bucket lists. Feels surreal. Bring frisbee/water shoes.'
        },
        {
            id: 'petroglyphs',
            title: 'San Rafael Swell Petroglyphs/Pictographs',
            location: 'Green River/Huntington area (~2h15m)',
            season: 'Spring/Fall',
            time: 'Half/Full Day',
            kidFriendly: true,
            obscure: '★★★★★',
            priority: 1,
            notes: 'Roadside panels that most tourists drive right past. Fun scavenger hunt for kids. Research specific accessible panels.'
        },
        {
            id: 'grafton',
            title: 'Grafton Ghost Town',
            location: 'Rockville, UT (~3h50m)',
            season: 'Spring/Fall',
            time: 'Half Day',
            kidFriendly: true,
            obscure: '★★★★☆',
            priority: 2,
            notes: 'Quiet, photogenic, off the main tourist trail compared to Springdale. Pair with Virgin River walk.'
        },
        {
            id: 'utahraptor',
            title: 'Utahraptor State Park',
            location: 'Near Moab (~4h)',
            season: 'Spring/Fall',
            time: 'Half Day',
            kidFriendly: true,
            obscure: '★★★★★',
            priority: 2,
            notes: 'Newer and still not widely known. Great for dino-obsessed kids.'
        },
        {
            id: 'fisher',
            title: 'Fisher Towers',
            location: 'Near Moab (~3h40m)',
            season: 'Spring/Fall',
            time: 'Full Day',
            kidFriendly: 'Older kids ok',
            obscure: '★★★★☆',
            priority: 2,
            notes: 'Less crowded than Delicate Arch/Canyonlands overlooks. Great short walks with big payoff.'
        }
    ],
    parks: [
        { id: 'zion', title: 'Zion National Park', location: '~2h50m from SLC', status: false, priority: 1, notes: 'Weekend doable. Focus on shuttle corridor or Kolob Canyons (less crowded).' },
        { id: 'bryce', title: 'Bryce Canyon National Park', location: '~3h40m from SLC', status: false, priority: 1, notes: 'Quick from SLC, unique hoodoos. Great for families (short walks).' },
        { id: 'capitolreef', title: 'Capitol Reef National Park', location: '~3h15m from SLC', status: false, priority: 1, notes: 'Underrated, Fruita fruit/picnic, petroglyphs, very family-friendly.' },
        { id: 'arches', title: 'Arches National Park', location: '~3h45m from SLC', status: false, priority: 1, notes: 'Iconic. Check current NPS info for timed entry if applicable.' },
        { id: 'canyonlands', title: 'Canyonlands National Park', location: '~3h50m from SLC (Island in the Sky)', status: false, priority: 1, notes: 'Do Island in the Sky first (easy overlooks).' },
        { id: 'grandteton', title: 'Grand Teton National Park', location: '~4h20m from SLC', status: false, priority: 2, notes: 'Combine with family days + deeper exploration.' },
        { id: 'yellowstone', title: 'Yellowstone National Park', location: '~5h15m from SLC', status: false, priority: 2, notes: 'Long drive but classic. Can combine with Grand Teton.' },
        { id: 'greatbasin', title: 'Great Basin National Park (NV)', location: '~3h50m from SLC', status: false, priority: 2, notes: 'Lehman Caves, Wheeler Peak, dark skies. Hidden gem.' }
    ],
    motoDay: [
        { id: 'west-desert', title: 'West Desert dirt-road shakedown', distance: 'Half day / choose-your-own-distance', season: 'Spring-Fall', fun: '★★★★☆', priority: 1, notes: 'Easy-to-scale gravel and dirt roads west of the Salt Lake Valley. Pick a route appropriate for the bikes and conditions; verify land access and fuel range.' },
        { id: 'silver-island', title: 'Silver Island Mountains / Great Salt Lake loop', distance: 'Approx. 50-mile loop (conditions vary)', season: 'Spring-Fall', fun: '★★★★★', priority: 1, notes: 'Remote Great Basin scenery and maintained dirt/gravel sections near Wendover. Check current road conditions, weather, and fuel before setting out.' },
        { id: 'san-rafael', title: 'San Rafael Swell backroads', distance: 'Full day; route-dependent', season: 'Spring/Fall', fun: '★★★★★', priority: 1, notes: 'A flexible dirt-bike day on legal roads and trails around the Swell. Choose a route for your skill level; avoid wet clay roads and check BLM closures.' },
        { id: 'buckhorn-draw', title: 'Buckhorn Draw & San Rafael Swell', distance: 'Full day from SLC; plan a long day or camp', season: 'Spring/Fall', fun: '★★★★★', priority: 1, notes: 'Ride the legal dirt/gravel approach and explore Buckhorn Draw’s canyon country near the Wedge. Confirm current BLM access, road conditions, fuel, and weather. Not a paved-road motorcycle route.' },
        { id: 'fish-springs', title: 'Fish Springs National Wildlife Refuge approach', distance: 'Full day / remote gravel roads', season: 'Spring/Fall', fun: '★★★★☆', priority: 2, notes: 'A remote West Desert outing on public roads. Check refuge rules and road conditions, carry extra water and fuel, and do not ride closed or soft refuge roads.' }
    ],
    motoOvernight: [
        { id: 'baja', title: 'Baja California dirt-bike expedition', distance: '7-14 days; route and mileage vary', season: 'November-April (check conditions)', fun: '★★★★★', priority: 1, notes: 'A multi-day off-road adventure on legal routes such as sections of the Baja Divide. Requires careful planning, suitable dirt/adventure bikes, border documentation, permits where required, fuel and emergency support. Not a street-bike touring itinerary.' },
        { id: 'labyrinth-canyon', title: 'Green River / Labyrinth Canyon dirt-road campout', distance: '2-3 days; route-dependent', season: 'Spring/Fall', fun: '★★★★★', priority: 1, notes: 'Explore legal public dirt roads near the Green River and Labyrinth Canyon, with a camp night. Verify BLM access, river/weather conditions, fuel stops, and camping rules before riding.' },
        { id: 'moab-dirt', title: 'Moab BDR-style dirt-bike weekend', distance: '2-3 days; choose legal routes', season: 'Spring/Fall', fun: '★★★★★', priority: 2, notes: 'Build a weekend from established, legal public routes around Moab, matching trails to rider skill and bike setup. Check current land-manager maps, closures, noise rules, and lodging/camping availability.' },
        { id: 'white-rim-dirt', title: 'White Rim Trail backcountry trip', distance: '2-3 days; permits required', season: 'Spring/Fall', fun: '★★★★★', priority: 2, notes: 'A remote, permit-controlled backcountry route in Canyonlands. Confirm current NPS rules on motorcycle access before planning—motorized access is restricted and rules can change; choose a legal dirt-bike alternative if bikes are not permitted.' }
    ]
};

let activities = [];
let hideCompleted = false;
const escapeHtml = value => String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const typeFor = category => category.startsWith('moto') ? 'moto' : category;

async function api(path, options = {}) {
    const response = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...options });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Request failed');
    return result;
}

function createCard(item) {
    const type = typeFor(item.category);
    const card = document.createElement('article');
    card.className = 'card' + (item.completed ? ' completed' : '');
    card.dataset.id = item.id;
    let badges = '';
    if (item.priority) badges += '<span class="badge badge-priority badge-priority-' + item.priority + '">Priority ' + escapeHtml(item.priority) + '</span>';
    if (type === 'family') {
        if (item.obscure) badges += '<span class="badge badge-obscure">Obscure: ' + escapeHtml(item.obscure) + '</span>';
        if (item.season) badges += '<span class="badge badge-season">' + escapeHtml(item.season) + '</span>';
    } else if (type === 'parks') {
        if (item.location) badges += '<span class="badge badge-season">' + escapeHtml(item.location) + '</span>';
    } else {
        if (item.fun) badges += '<span class="badge">Fun: ' + escapeHtml(item.fun) + '</span>';
        if (item.season) badges += '<span class="badge badge-season">' + escapeHtml(item.season) + '</span>';
    }
    let meta = '';
    if (type === 'family') meta = [item.location && '<span>📍 ' + escapeHtml(item.location) + '</span>', item.time && '<span>⏱️ ' + escapeHtml(item.time) + '</span>', item.kidFriendly && '<span>👶 ' + (item.kidFriendly === true ? 'Kid-friendly' : escapeHtml(item.kidFriendly)) + '</span>'].filter(Boolean).join('');
    else if (type === 'parks' && item.location) meta = '<span>📍 ' + escapeHtml(item.location) + '</span>';
    else if (item.distance) meta = '<span>🛣️ ' + escapeHtml(item.distance) + '</span>';
    card.innerHTML = '<div class="card-header"><h3 class="card-title">' + escapeHtml(item.title) + '</h3><div class="card-badges">' + badges + '</div></div>' +
        '<div class="card-meta">' + meta + '</div><p class="card-notes">' + escapeHtml(item.notes) + '</p>' +
        '<div class="card-footer"><button class="vote-btn ' + (item.votes ? 'voted' : '') + '" data-action="vote">👍 Vote <span class="vote-count">' + item.votes + '</span></button>' +
        '<button class="check-btn ' + (item.completed ? 'completed' : '') + '" data-action="complete">' + (item.completed ? '✓ Done' : 'Mark Done') + '</button></div>';
    return card;
}

function renderCards() {
    const groups = {family:'family-cards', parks:'parks-cards', motoDay:'moto-day-cards', motoOvernight:'moto-overnight-cards'};
    Object.entries(groups).forEach(([category, id]) => {
        const container = document.getElementById(id);
        container.innerHTML = '';
        activities.filter(item => item.category === category && (!hideCompleted || !item.completed)).forEach(item => container.appendChild(createCard(item)));
    });
    document.getElementById('completed-count').textContent = activities.filter(item => item.completed).length + ' completed';
}

async function loadActivities() {
    try {
        activities = await api('/api/initialize', {method:'POST', body:JSON.stringify({seed:bucketListData})});
        renderCards();
    } catch (error) {
        document.getElementById('app-message').textContent = 'Could not connect to SQLite. Start the app with: python3 server.py (' + error.message + ')';
    }
}

const freshIdeas = [
    {id:'swell-wedge',category:'motoDay',title:'The Wedge overlook & dirt-road loop',distance:'Full day; route-dependent',season:'Spring/Fall',fun:'★★★★★',priority:2,notes:'Ride legal dirt roads to the San Rafael Swell’s Wedge overlook. Match the route to your group; check BLM maps, conditions, and fuel range.'},
    {id:'burr-trail-dirt',category:'motoOvernight',title:'Burr Trail & Henry Mountains dirt-road trip',distance:'2-3 days; route-dependent',season:'Spring/Fall',fun:'★★★★★',priority:2,notes:'Plan a dirt/adventure-bike trip on public roads near the Burr Trail and Henry Mountains. Verify road status, weather, permits, and fuel.'},
    {id:'baja-divide',category:'motoOvernight',title:'Baja Divide section ride',distance:'Multi-day; choose a section',season:'November-April',fun:'★★★★★',priority:2,notes:'Choose a manageable segment for a dirt-bike trip. Research current route notes, border requirements, water, fuel, and emergency plans.'},
    {id:'cedar-mountain',category:'motoDay',title:'Cedar Mountain / Skull Valley gravel adventure',distance:'Full day; remote',season:'Spring/Fall',fun:'★★★★☆',priority:2,notes:'Explore only legal public roads across the West Desert. Check land ownership, closures, weather, fuel, and carry water and recovery gear.'},
    {id:'escalante-dirt',category:'motoOvernight',title:'Grand Staircase-Escalante dirt-road campout',distance:'2-4 days',season:'Spring/Fall',fun:'★★★★★',priority:2,notes:'Build a legal dirt-road itinerary using current BLM maps. Avoid flash-flood-prone canyons and wet clay; plan fuel, water, and camping.'},
    {id:'dutch-john',category:'motoDay',title:'Flaming Gorge backcountry roads',distance:'Full day',season:'Late Spring-Fall',fun:'★★★★☆',priority:3,notes:'Link legal gravel roads and viewpoints near Dutch John. Check seasonal gates, land-manager rules, and road conditions.'}
];

document.addEventListener('click', async event => {
    const button = event.target.closest('[data-action]');
    if (button) {
        try {
            const card = button.closest('.card');
            const updated = await api('/api/activities/' + encodeURIComponent(card.dataset.id) + '/' + button.dataset.action, {method:'POST'});
            activities = activities.map(item => item.id === updated.id ? updated : item);
            renderCards();
        } catch (error) { document.getElementById('app-message').textContent = error.message; }
    }
    const filterButton = event.target.closest('.filter-btn');
    if (filterButton) {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b === filterButton));
        const filter = filterButton.dataset.filter;
        document.querySelectorAll('.section').forEach(section => section.style.display = filter === 'all' || section.id === filter ? 'block' : 'none');
    }
    if (event.target.closest('#generate-idea')) {
        const available = freshIdeas.filter(idea => !activities.some(item => item.id === idea.id));
        if (!available.length) { document.getElementById('app-message').textContent = 'All current fresh-idea suggestions have been added.'; return; }
        const idea = available[Math.floor(Math.random() * available.length)];
        try { activities.push(await api('/api/activities', {method:'POST',body:JSON.stringify(idea)})); renderCards(); }
        catch (error) { document.getElementById('app-message').textContent = error.message; }
    }
});

document.getElementById('hide-completed').addEventListener('change', event => { hideCompleted = event.target.checked; renderCards(); });
document.getElementById('activity-form').addEventListener('submit', async event => {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const category = fields.get('category');
    const idea = {category, title:fields.get('title').trim(), notes:fields.get('notes').trim(), priority:2, season:fields.get('season').trim()};
    if (category.startsWith('moto')) idea.distance = fields.get('distance').trim();
    else idea.location = fields.get('distance').trim();
    try {
        activities.push(await api('/api/activities', {method:'POST',body:JSON.stringify(idea)}));
        event.currentTarget.reset(); renderCards(); document.getElementById('app-message').textContent = 'Activity saved to SQLite.';
    } catch (error) { document.getElementById('app-message').textContent = error.message; }
});

document.addEventListener('DOMContentLoaded', loadActivities);
