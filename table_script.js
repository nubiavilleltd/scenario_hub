const tableId = window.myTableId || "table";
const tableId2 = window.myTableId2 || "";

$(document).ready(function () {
  flatpickr("#scenario_date", {
    dateFormat: "d/m/Y",
  });
  flatpickr("#period_month", {
    dateFormat: "M Y",
  });
});
$.fn.bootstrapTable.locales["en-US"] = {
  formatShowingRows: function (pageFrom, pageTo, totalRows) {    
    const pageSize = $(`#${tableId}`).bootstrapTable("getOptions").pageSize;
    const currentPage = Math.ceil(pageFrom / pageSize);
    const totalPages = Math.ceil(totalRows / pageSize);
    return `Page ${currentPage} | ${totalPages} of ${totalRows} rows`;
  },
  formatRecordsPerPage: function (pageNumber) {
    return `${pageNumber} rows per page`;
  },
};
$.extend($.fn.bootstrapTable.defaults, $.fn.bootstrapTable.locales["en-US"]);

$(`#${tableId}`).bootstrapTable({
  pagination: true,
  locale: "en-US",
  icons: {
    sort: "fa-solid fa-sort",
    sortAsc: "fa-solid fa-arrow-up",
    sortDesc: "fa-solid fa-arrow-down",
  },
  onPostBody: function () {
    if (
      tableId == "table" ||
      tableId == "dataTable" ||
      tableId == "recoveryRateTable"
    ) {
      $(`#${tableId} tbody tr`).each(function () {
        $(this)
          .find("td")
          .each(function (i) {
            if (i > 0) {
              const $td = $(this);
              if ($td.find("span").length === 0) {
                const text = $td.text().trim();
                $td.html(`<span class="editable-span">${text}</span>`);
                $td.attr("contenteditable", true).addClass("editable-cell");
              }
            }
          });
      });
    }
    const $searchGroup = $(".fixed-table-toolbar");
    if (tableId == "scenarioTable" || tableId == "forecast") {
      if ($("#export-btn").length === 0) {
        const exportBtn = $(`
              <div class="">
                <button id="export-btn" class="btn btn-outline-success">
                  <img src="./images/excel-icon.svg" alt="Excel" style="height: 18px; margin-right: 5px;"> Export
                </button>
              </div>
            `);
        $searchGroup.append(exportBtn);
      }
    }
    if (tableId == "dataTable") {
      if ($("#export-price").length === 0) {
        const exportBtn = $(`
              <div class="gap-3">
                <button id="export-price" class="btn btn-outline-success">
                  <img src="./images/excel-icon.svg" alt="Excel" style="height: 18px; margin-right: 5px;"> Export
                </button>
                <button data-bs-toggle="modal" data-bs-target="#uploadPrice" type="button" class="btn btn-outline-create">
                    <i class="fa-solid fa-circle-plus"></i> Import Price
                </button>
              </div>
            `);
        $searchGroup.append(exportBtn);
      }
    }
    // Append Create Scenario Button if not already present for view scenario page
    if (tableId == "scenarioTable") {
      if ($("#create-btn").length === 0) {
        const createBtn = $(`
          <div class="ml-auto">
            <a id="create-btn" href="./create.html" class="btn btn-create">
              <i class="fa-solid fa-circle-plus"></i> Create Scenario
            </a>
          </div>
        `);
        $searchGroup.append(createBtn);
      }
    }
    if (tableId2 == "download") {
      if ($("#download-btn").length === 0) {
        const downloadBtn = $(`
          <div class="ml-auto">
            <button data-bs-toggle="modal" data-bs-target="#uploadBtn" type="button" class="btn btn-outline-create">
              <i class="fa-solid fa-circle-plus"></i> Upload SOP
            </button>
            <a id="download-btn" href="#" class="btn btn-create">
              <i class="fa-solid fa-circle-plus"></i> Download SOP Template
            </a>
          </div>
        `);
        $searchGroup.append(downloadBtn);
      }
    }
  },
});
if (tableId2 == "declineRateTable") {
  $(`#${tableId2}`).bootstrapTable({    
    pagination: true,
    locale: "en",
    icons: {
      sort: "fa-solid fa-sort",
      sortAsc: "fa-solid fa-arrow-up",
      sortDesc: "fa-solid fa-arrow-down",
    },
    onPostBody: function () {
      $(`#${tableId2} tbody tr`).each(function () {
        $(this)
          .find("td")
          .each(function (i) {
            if (i > 0) {
              const $td = $(this);
              if ($td.find("span").length === 0) {
                const text = $td.text().trim();
                $td.html(`<span class="editable-span">${text}</span>`);
                $td.attr("contenteditable", true).addClass("editable-cell");
              }
            }
          });
      });
    },
  });
}

// Export Visible Data
$(document).on("click", "#export-price", function () {
  const exportInstance = new TableExport(
    document.getElementById(`${tableId}`),
    {
      exportButtons: false,
      filename: "table-export",
      sheetname: "Sheet 1",
    }
  );
  const exportData = exportInstance.getExportData()[`${tableId}`]["xlsx"];
  exportInstance.export2file(
    exportData.data,
    exportData.mimeType,
    exportData.filename,
    exportData.fileExtension,
    exportData.merges,
    exportData.RTL,
    exportData.sheetname
  );
});

// Export all data
$(document).on("click", "#export-btn", function () {
  const $table = $(`#${tableId}`);
  const currentOptions = $table.bootstrapTable("getOptions");
  const currentPageNumber = currentOptions.pageNumber;
  const currentPageSize = currentOptions.pageSize;
  const currentSearchText = currentOptions.searchText;
  $table.bootstrapTable("refreshOptions", {
    pagination: false,
    search: false,
  });

  setTimeout(() => {
    const exportInstance = new TableExport(
      document.getElementById(`${tableId}`),
      {
        exportButtons: false,
        filename: "table-export",
        sheetname: "Sheet 1",
      }
    );
    const exportData = exportInstance.getExportData()[`${tableId}`]["xlsx"];
    exportInstance.export2file(
      exportData.data,
      exportData.mimeType,
      exportData.filename,
      exportData.fileExtension,
      exportData.merges,
      exportData.RTL,
      exportData.sheetname
    );
    $table.bootstrapTable("refreshOptions", {
      pagination: true,
      pageNumber: currentPageNumber,
      pageSize: currentPageSize,
      search: true,
    });
  }, 500);
});

$(`#${tableId}`).on("blur", ".editable-cell", function () {
    const $cell = $(this);
    const newValue = $cell.text();
    const rowIndex = $cell.closest("tr").data("index");
    const colIndex = $cell.index();
  
    const field = $(`#${tableId}`).bootstrapTable("getOptions").columns[0][
      colIndex
    ].field;
  
    $(`#${tableId}`).bootstrapTable("updateCell", {
      index: rowIndex,
      field: field,
      value: newValue,
    });
  });