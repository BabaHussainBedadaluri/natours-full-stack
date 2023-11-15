if (document.getElementById('map')) {
  const locations = JSON.parse(
    document.getElementById('map').dataset.locations
  );

  mapboxgl.accessToken =
    'pk.eyJ1IjoiYmFiYWh1c3NhaW4yMDAwIiwiYSI6ImNsbnE5NHFzNTE0OTAybG82aXNnNDNwOHcifQ.YQZbhp11hHgLV1jl0w5TlQ';
  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/babahussain2000/clo8bi55100wi01qv722vabcu', // style URL
    scrollZoom: false,
    // interaction: false,
  });

  const bounds = new mapboxgl.LngLatBounds();
  locations.forEach((loc) => {
    const el = document.createElement('div');
    el.className = 'marker';
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
}
