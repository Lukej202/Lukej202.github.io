let map
const serviceCenter = [39.3321, -84.4173];
const serviceRadius = 16093; // 10 miles
const extendedRadius = 25000; // 20 miles in meters
document.addEventListener("DOMContentLoaded", () => {
    map = L.map('map').setView([39.3321, -84.4173], 11); 

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    L.circle(serviceCenter, {
        color: 'green',
        fillColor: '#7cff7c',
        fillOpacity: 0.2,
        radius: serviceRadius
    }).addTo(map);

    // Extended service area (yellow)
    const extendedCircle = L.circle(serviceCenter, {
        color: 'gold',
        fillColor: '#ffff66',
        fillOpacity: 0.15,
        radius: extendedRadius
    }).addTo(map);

    map.on('click', function(e) {
        // const userLatLng = e.latlng;
        // const distance = map.distance(serviceCenter, userLatLng);
        // const message = distance <= serviceRadius
        // ? "✅ You're within our service area!"
        // : "❌ Sorry, you're outside our service area.";
        // document.getElementById('status').textContent = message;
        const userLatLng = e.latlng;
        const distance = map.distance(serviceCenter, userLatLng);
        let message = "";

        if (distance <= serviceRadius) {
            message = "✅ You're within our standard service area!";
        } else if (distance <= extendedRadius) {
            message = "⚠️ You're in our extended area — special appointments only.";
        } else {
            message = "❌ Sorry, you're outside our service area.";
        }

        document.getElementById('status').textContent = message;
    });
    // 👉 Force map to re-layout tiles correctly after load
    setTimeout(() => {
        map.invalidateSize();
    }, 100);
});

function checkAddress() {
    const address = document.getElementById("addressInput").value;

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`)
    .then(response => response.json())
    .then(data => {
    if (data.length === 0) {
        document.getElementById("addressStatus").textContent = "❌ Address not found.";
        return;
    }

    const lat = parseFloat(data[0].lat);
    const lon = parseFloat(data[0].lon);
    const distance = map.distance(serviceCenter, [lat, lon]);

        // Determine which zone the address falls in
    let message = "";
    if(distance <= serviceRadius) {
        message = "✅ You're within our standard service area!";
    } else if (distance <= extendedRadius) {
        message = "⚠️ You're in our extended area — special appointments only.";
    } else {
        message = "❌ Sorry, you're outside our service area.";
    }

    document.getElementById("addressStatus").textContent = message;

        // Add marker and zoom in
    L.marker([lat, lon]).addTo(map).bindPopup("Your location").openPopup();
    map.setView([lat, lon], 12);
})
    .catch(err => {
        console.error(err);
        document.getElementById("addressStatus").textContent = "❌ Error looking up address.";
    });
}

function checkUserLocation() {
    if (!navigator.geolocation) {
        document.getElementById("geoStatus").textContent = "❌ Geolocation is not supported by your browser.";
        return;
    }

    document.getElementById("geoStatus").textContent = "📡 Locating...";

    navigator.geolocation.getCurrentPosition(
    (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const distance = map.distance(serviceCenter, [lat, lon]);

        let message = "";
        if (distance <= serviceRadius) {
            message = "✅ You're within our standard service area!";
        } else if (distance <= extendedRadius) {
            message = "⚠️ You're in our extended area — special appointments only.";
        } else {
            message = "❌ Sorry, you're outside our service area.";
        }

        document.getElementById("geoStatus").textContent = message;

        // Show marker and zoom in
        L.marker([lat, lon]).addTo(map).bindPopup("You are here").openPopup();
        map.setView([lat, lon], 12);
    },
    (error) => {
        console.error(error);
        document.getElementById("geoStatus").textContent = "❌ Unable to retrieve your location.";
    }
    );
}