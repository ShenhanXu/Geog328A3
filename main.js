// main.js

// Initialize map
mapboxgl.accessToken = 'pk.eyJ1IjoiamFrb2J6aGFvIiwiYSI6ImNpcms2YWsyMzAwMmtmbG5icTFxZ3ZkdncifQ.P9MBej1xacybKcDN_jehvw';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
    center: [114.1095, 37.9404], // starting position [lng, lat]
    zoom: 4 // starting zoom
});

// Initialize variables for storing data
let maoData;
let chiangData;
let maoSortOrder = 1; // 1 for ascending, -1 for descending
let chiangSortOrder = 1; // 1 for ascending, -1 for descending

// Fetch Mao's data
const maoPromise = fetch('assets/mao.json')
    .then(response => response.json())
    .then(data => {
        maoData = data;  // assign the data to maoData
        addMarkersToMap(maoData, "Mao Zedong");
    })
    .catch(error => console.error('Error fetching Mao\'s data:', error));

// Fetch Chiang's data
const chiangPromise = fetch('assets/chiang.json')
    .then(response => response.json())
    .then(data => {
        chiangData = data;  // assign the data to chiangData
        addMarkersToMap(chiangData, "Chiang Kai-shek");
    })
    .catch(error => console.error('Error fetching Chiang\'s data:', error));

// Wait for both promises to resolve
Promise.all([maoPromise, chiangPromise])
    .then(() => {
        // Generate the table
        generateTable(maoData, chiangData);
    });

    function generateTable(maoData, chiangData) {
        const sidePanel = document.getElementById("side-panel");
        const tableContainer = document.getElementById("table-container"); // Get table-container
        tableContainer.innerHTML = "Mao Zedong and Chiang Kai-shek";
        const maoHeader = document.createElement("h3");

        const maoTable = createTable(maoData);
        tableContainer.appendChild(maoTable); // Append to table-container
    
        const chiangHeader = document.createElement("h3");

        const chiangTable = createTable(chiangData);
        tableContainer.appendChild(chiangTable); // Append to table-container
    
        // Sort by Date button
        const sortButton = document.createElement("button");
        sortButton.textContent = "Sort by Date";
        sortButton.id = "sort-button"; // Add an ID for styling
        sortButton.addEventListener("click", () => {
            sortTableByDate(maoTable, "Mao Zedong");
            sortTableByDate(chiangTable, "Chiang Kai-shek");
        });
        sidePanel.insertBefore(sortButton, sidePanel.firstChild); // Insert button at the top
    }

function createTable(data) {
    const table = document.createElement("table");

    const header = document.createElement("tr");
    ["Year", "Event", "Details"].forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        header.appendChild(th);
    });
    table.appendChild(header);

    data.features.forEach(feature => {
        const tr = document.createElement("tr");
        [feature.properties.year, feature.properties.event, feature.properties.details].forEach(text => {
            const td = document.createElement("td");
            td.textContent = text;
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });

    return table;
}

function sortTableByDate(table, headerText) {
    const rows = Array.from(table.querySelectorAll("tr"));

    // Remove the table header row from sorting
    const headerRow = rows.shift();

    const sortOrder = headerText === "Mao Zedong" ? maoSortOrder : chiangSortOrder;

    rows.sort((rowA, rowB) => {
        const dateA = new Date(rowA.cells[0].textContent);
        const dateB = new Date(rowB.cells[0].textContent);
        return sortOrder * (dateA - dateB); // Apply the sorting order
    });

    // Toggle the sorting order for the next click
    if (headerText === "Mao Zedong") {
        maoSortOrder *= -1;
    } else if (headerText === "Chiang Kai-shek") {
        chiangSortOrder *= -1;
    }

    // Reconstruct the table with sorted rows
    table.innerHTML = "";
    table.appendChild(headerRow);
    rows.forEach(row => table.appendChild(row));
}

function addMarkersToMap(data, name) {
    const markers = data.features.map(feature => {
      const markerColor = name === "Mao Zedong" ? "red" : "black";
  
      const marker = new mapboxgl.Marker({ color: markerColor })
        .setLngLat(feature.geometry.coordinates)
        .setPopup(new mapboxgl.Popup().setHTML(`<h3>${name}</h3><p>${feature.properties.event}</p>`))
        .addTo(map);
        
      return marker;
    });
  
    return markers;
  }
  