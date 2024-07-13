function openNav() {
    document.getElementById("mySidebar").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
  }
  
  function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
  }
  
  function toggleProfileDropdown() {
    var dropdown = document.getElementById("profile-dropdown");
    dropdown.classList.toggle("show");
  }

  document.addEventListener('DOMContentLoaded', function () {
    fetchDataAndPopulateTable();
});

function fetchDataAndPopulateTable() {
    fetch('https://your-api-endpoint-url')
        .then(response => response.json())
        .then(data => {
            populateTable(data);
        })
        .catch(error => alert.error('Error fetching data:', error));
}

function populateTable(data) {
    const tableBody = document.querySelector('tbody');
    tableBody.innerHTML = ''; // Clear existing table rows

    data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.nim}</td>
            <td>${item.penulis}</td>
            <td>${item.judul}</td>
            <td>${item.dosen}</td>
            <td>${item.program_studi}</td>
            <td>${item.fakultas}</td>
            <td>${item.tanggal_upload}</td>
            <td>${item.tanggal_approval}</td>
            <td>${item.status}</td>
            <td><button>View</button></td>
        `;
        tableBody.appendChild(row);
    });
}
  