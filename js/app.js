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

const starterPins = Object.values(bucketListData).flat().map(item => ({
    id: item.id,
    title: item.title,
    where: item.location || (item.distance ? `Route TBD · ${item.distance}` : ''),
    when: [item.season, item.time].filter(Boolean).join(' · '),
    who: '',
    what: item.notes || ''
}));

let pins = [];
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));

async function api(path, options = {}) {
    const response = await fetch(path, {
        headers: { 'Content-Type': 'application/json' },
        ...options
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Request failed');
    return result;
}

function renderField(label, value) {
    const missing = !value;
    return `<p class="pin-field ${missing ? 'empty' : ''}">
        <strong>${label}</strong><span>${escapeHtml(value || 'Not set yet')}</span>
    </p>`;
}

function createPinCard(pin) {
    const card = document.createElement('article');
    card.className = 'pin-card';
    card.dataset.id = pin.id;
    card.innerHTML = `<h3 class="pin-title">${escapeHtml(pin.title)}</h3>
        <div class="pin-fields">
            ${renderField('Where', pin.where)}
            ${renderField('When', pin.when)}
            ${renderField('Who', pin.who)}
            ${renderField('What to do there', pin.what)}
        </div>
        <div class="pin-footer">
            <button class="plus-btn" type="button" data-action="plus" aria-label="Add a plus to ${escapeHtml(pin.title)}">
                +1 <span>${Number(pin.pluses) || 0}</span>
            </button>
        </div>`;
    return card;
}

function renderPins() {
    const board = document.getElementById('pin-board');
    board.replaceChildren();
    document.getElementById('pin-count').textContent = `${pins.length} ${pins.length === 1 ? 'pin' : 'pins'}`;
    if (!pins.length) {
        board.innerHTML = '<p class="empty-board">No pins yet. Add an idea to get started.</p>';
        return;
    }
    pins.forEach(pin => board.appendChild(createPinCard(pin)));
}

async function loadPins() {
    try {
        pins = await api('/api/initialize', {
            method: 'POST',
            body: JSON.stringify({ pins: starterPins })
        });
        renderPins();
    } catch (error) {
        document.getElementById('app-message').textContent =
            'Could not connect to the API. Start the app with: go run ./cmd/family-hub (' + error.message + ')';
    }
}

document.getElementById('pin-form').addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const pin = Object.fromEntries(['title', 'where', 'when', 'who', 'what'].map(key => [
        key, String(fields.get(key) || '').trim()
    ]));
    try {
        const created = await api('/api/pins', { method: 'POST', body: JSON.stringify(pin) });
        pins.unshift(created);
        renderPins();
        form.reset();
        document.getElementById('app-message').textContent = 'Pin added to the board.';
    } catch (error) {
        document.getElementById('app-message').textContent = error.message;
    }
});

document.addEventListener('click', async event => {
    const button = event.target.closest('[data-action="plus"]');
    if (!button) return;
    button.disabled = true;
    try {
        const card = button.closest('.pin-card');
        const updated = await api('/api/pins/' + encodeURIComponent(card.dataset.id) + '/plus', { method: 'POST' });
        pins = pins.map(pin => pin.id === updated.id ? updated : pin);
        renderPins();
        document.getElementById('app-message').textContent = 'Plus added.';
    } catch (error) {
        button.disabled = false;
        document.getElementById('app-message').textContent = error.message;
    }
});

document.addEventListener('DOMContentLoaded', loadPins);
