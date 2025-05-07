$(document).ready(function () {
  const tableId = window.myTableId || "forecast";

  const table = $(`#${tableId}`).DataTable({
    paging: true,
    pageLength: 15,
    lengthChange: false,
    ordering: true,
    info: false,
    language: {
      paginate: {
        previous: '<i class="fa-solid fa-chevron-left"></i>',
        next: '<i class="fa-solid fa-chevron-right"></i>',
      },
    },
    columnDefs: [
      {
        targets: [1, 2],
        createdCell: function (td, cellData, rowData, row, col) {
          $(td).attr("contenteditable", "true").addClass("editable-cell");
        },
      },
    ],
    initComplete: function () {
      $("#forecast thead th")
        .eq(0)
        .append(
          '&nbsp; &nbsp;<i class="fa-solid fa-arrow-up"></i><i class="fa-solid fa-arrow-down"></i>'
        );
      const wrapper = $(`#${tableId}_wrapper`);
      const topRow = wrapper.find(".row").first();
      const bottomRow = wrapper.find(".row").last();
      bottomRow.find(".col-sm-12.col-md-5").remove();
      wrapper
        .find(".dataTables_paginate ul.pagination")
        .addClass("pagination-rounded");
      // Create flex container to hold search + export
      const leftCol = $(
        '<div class="d-flex align-items-center justify-content-start gap-2 col-md-6 mb-2 mb-md-0"></div>'
      );
      const rightCol = $(
        '<div class="col-md-6 d-flex justify-content-end"></div>'
      );
      // Move search input into left column and clean it
      const searchDiv = wrapper.find(".dataTables_filter");
      const searchInput = searchDiv.find("input");
      // Remove label text and add placeholder
      searchDiv
        .find("label")
        .contents()
        .filter(function () {
          return this.nodeType === 3;
        })
        .remove();
      searchInput.attr("placeholder", "Search...");
      leftCol.append(searchDiv);
      // Export button
      const exportBtn = $(`
              <button id="customExport" class="btn btn-outline-success d-flex align-items-center">
                <img src="./images/excel-icon.svg" alt="Excel" style="height: 18px; margin-right: 5px;">
                Export
              </button>
            `);
      leftCol.append(exportBtn);
      // Right-end "Create Scenario" button
      let createBtn;
      if (tableId == "scenarioTable") {
        createBtn = $(`
                  <a href="./create.html" class="btn btn-create">
                    <i class="fa-solid fa-circle-plus"></i> Create Scenario
                  </a>
                `);
      } else {
        createBtn = $(``);
      }
      rightCol.append(createBtn);
      // Replace the original columns
      topRow.empty().append(leftCol).append(rightCol);
    },
  });
});

$(document).on("click", "#customExport", function () {
  const tableId = window.myTableId || "forecast";
  const table = $(`#${tableId}`).DataTable();

  const data = table.rows({ search: "applied" }).data();
  const headers = [];

  // Get column headers
  $(`#${tableId} thead th`).each(function () {
    headers.push(`"${$(this).text().trim().replace(/"/g, '""')}"`);
  });

  const csv = [headers.join(",")];

  // Loop through all rows in DataTable
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowData = [];

    for (let j = 0; j < row.length; j++) {
      rowData.push(
        `"${decodeHtmlEntities(String(row[j])).replace(/"/g, '""')}"`
      );      
    }

    csv.push(rowData.join(","));
  }

  const csvString = csv.join("\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "table_export.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

function decodeHtmlEntities(str) {
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
}
