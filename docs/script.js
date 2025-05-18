// Add Logo START
document.getElementById("logoUpload").addEventListener("change", function (e) {
	const reader = new FileReader();
	reader.onload = function (event) {
		const preview = document.getElementById("logoPreview");
		preview.src = event.target.result;
		preview.classList.remove("hidden");
		const uploadText = document.getElementById("uploadText");
		uploadText.classList.add("hidden");
	};
	reader.readAsDataURL(e.target.files[0]);
});
// Add Logo END

// Auto Formatting Currency START
const priceFormat = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
	minimumFractionDigits: 2,
});
// Event Delegation for all `.price` inputs
$(document).on("input", ".price", function () {
	let value = $(this)
		.val()
		.replace(/[^0-9]/g, "");
	if (value) {
		let number = parseFloat(value) / 100;
		$(this).val(priceFormat.format(number));
	} else {
		$(this).val("");
	}
	calculateTotals();
});

function formatTotalsDisplay() {
	// Format total per baris
	$(".total").each(function () {
		let val = parseFloat($(this).val()) || 0;
		$(this).val(priceFormat.format(val));
	});

	// Format subtotal
	let subtotalVal = parseFloat($("#subtotal").val()) || 0;
	$("#subtotal").val(priceFormat.format(subtotalVal));
}
// Format shipping
$(document).on("input", "#shipping", function () {
	let value = $(this)
		.val()
		.replace(/[^0-9]/g, "");
	if (value) {
		let number = parseFloat(value) / 100;
		$(this).val(priceFormat.format(number));
	} else {
		$(this).val("");
	}
	calculateTotals();
});

// Auto % on tax START
$(document).on("input", "#tax", function () {
	let val = $(this)
		.val()
		.replace(/[^0-9.]/g, "");
	if (val !== "") {
		$(this).val(val + "%");
	}
});
// Auto % on tax END

// Auto % on discount START
$(document).on("input", "#discount", function () {
	let val = $(this)
		.val()
		.replace(/[^0-9.]/g, "");
	if (val !== "") {
		$(this).val(val + "%");
	}
});
// Auto % on discount END
// Auto Formatting Currency END

// Add Item & Remove Item START
$(document).ready(function () {
	$('button:contains("⊕ Add Item")').click(function () {
		// Show checkboxes
		$(".delete-checkbox").each((_, checkbox) => {
			$(checkbox).removeClass("hidden");
		});

		// Show the delete button
		$("#deleteSelected").removeClass("hidden");

		// Add Item
		const count = $(".item-row").length + 1;
		const itemRow = `
    <div class="space-y-2 mt-5 input-container relative">
			<div class="sm:hidden w-full md:w-2/3 flex flex-col mt-4 md:mt-0">
        <span class="text-white text-center text-sm font-bold bg-black px-9 py-2 rounded">Item Info</span>
      </div>
			<input type="checkbox" class="delete-checkbox absolute left-3 top-4.5 -translate-y-1/2 w-4 h-4 cursor-pointer " title="Select to delete" />
			<div class="hidden sm:flex text-white text-sm font-bold overflow-hidden rounded relative">
			<input type="checkbox" class="delete-checkbox absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 cursor-pointer" title="Select to delete" />
        <div class="sm:flex-[2] bg-black px-2 py-1   text-center">Item Name</div>
        <div class="sm:flex-[1] bg-black px-2 py-1   text-center">Quantity</div>
        <div class="sm:flex-[1.5] bg-black px-2 py-1   text-center">Unit Price</div>
        <div class="sm:flex-[1.5] bg-black px-2 py-1  text-center">Total</div>
      </div>
    
      <div class="flex flex-col sm:flex-row gap-2 item-row">
        <div class="sm:flex-[2]">
          <input type="text" class="nm w-full p-2 rounded text-white bg-zinc-500" placeholder="Item Name" />
        </div>
        <div class="sm:flex-[1]">
          <input type="number" class="qty w-full p-2 rounded text-white bg-zinc-500" placeholder="Qty" />
        </div>
        <div class="sm:flex-[1.5]">
          <input type="text" class="price w-full p-2 rounded text-white bg-zinc-500" placeholder="$1,000.00" />
        </div>
        <div class="sm:flex-[1.5]">
          <input type="text" class="total w-full p-2 rounded text-white bg-zinc-500" readonly />
        </div>
      </div>
    </div>
      `;
		$(this).parent().before(itemRow);
	});

	// Remove Item
	$("#deleteSelected").click(function () {
		$(".delete-checkbox:checked").each(function () {
			$(this).closest(".input-container").remove();
		});
		calculateTotals();
	});
});
// Add Item & Remove Item END

// Total START
function calculateTotals() {
	let subtotal = 0;

	// Hitung total untuk tiap item
	$(".item-row").each(function () {
		const qty = parseFloat($(this).find(".qty").val()) || 0;
		const priceRaw = $(this).find(".price").val() || "0";
		const priceText = priceRaw.replace(/[^0-9.-]+/g, "");
		const price = parseFloat(priceText) || 0;
		const total = qty * price;

		$(this)
			.find(".total")
			.val(total.toLocaleString("en-US", { style: "currency", currency: "USD" }));
		subtotal += total;
	});

	// Update subtotal field
	$("#subtotal").val(
		subtotal.toLocaleString("en-US", { style: "currency", currency: "USD" })
	);

	// Tax, Discount, Shipping
	const taxRate = parseFloat($("#tax").val()) || 0;
	const discountRate = parseFloat($("#discount").val()) || 0;
	const shipping =
		parseFloat(
			$("#shipping")
				.val()
				.replace(/[^0-9]/, "")
		) || 0;
	const taxAmount = subtotal * (taxRate / 100);
	const discountAmount = subtotal * (discountRate / 100);
	const grandTotal = subtotal + taxAmount - discountAmount + shipping;
	$("#grandTotal").text(
		grandTotal.toLocaleString("en-US", { style: "currency", currency: "USD" })
	);
}

// Jalankan saat ada perubahan
$(document).on("input", ".qty, #tax, #discount, #shipping", calculateTotals);
// Total END

// Modal START
$(document).ready(function () {
	$("[data-modal-toggle]").on("click", function () {
		const modalId = $(this).data("modal-toggle");
		const $modal = $("#" + modalId);
		$modal.toggleClass("hidden");
	});
});
// Modal END

// Capture modal bill by data START
$(document).ready(function () {
	$("#add-by").on("click", function () {
		const userName = $("#user-name").val();
		const userTin = $("#user-tin").val();
		const userAddress = $("#user-address").val();
		const userAddressA = $("#user-address-a").val();
		const userPostalCode = $("#user-postal-code").val();
		const userCity = $("#user-city").val();
		const userDistrict = $("#user-district").val();
		const userCountry = $("#user-country").val();
		const userPhoneNumber = $("#user-phone-number").val();
		const userWebsite = $("#user-website").val();
		const userEmail = $("#user-email").val();

		const displayText = `<p> ${userName} <br> ${userTin} <br> ${userAddress} <br> ${userAddressA} <br> ${userPostalCode} <br> ${userCity} <br> ${userDistrict} <br> ${userCountry} <br> ${userPhoneNumber} <br> ${userWebsite} <br> ${userEmail} </p>`;
		$("#billByText").html(displayText);

		$("#crud-modal-by").addClass("hidden");
	});
});
// Capture modal bill by data END

// Capture modal bill to data START
$(document).ready(function () {
	$("#add-to").on("click", function () {
		const clientName = $("#client-name").val();
		const clientTin = $("#client-tin").val();
		const clientAddress = $("#client-address").val();
		const clientAddressA = $("#client-address-a").val();
		const clientPostalCode = $("#client-postal-code").val();
		const clientCity = $("#client-city").val();
		const clientDistrict = $("#client-district").val();
		const clientCountry = $("#client-country").val();
		const clientPhoneNumber = $("#client-phone-number").val();
		const clientWebsite = $("#client-website").val();
		const clientEmail = $("#client-email").val();

		const displayText = `<p> ${clientName} <br> ${clientTin} <br> ${clientAddress} <br> ${clientAddressA} <br> ${clientPostalCode} <br> ${clientCity} <br> ${clientDistrict} <br> ${clientCountry} <br> ${clientPhoneNumber} <br> ${clientWebsite} <br> ${clientEmail} </p>`;
		$("#billToText").html(displayText);

		$("#crud-modal-to").addClass("hidden");
	});
});
// Capture modal bill to data END

// Preview and Download Invoice START
$(document).ready(function () {
	$("#previewPDF").on("click", function () {
		const invoiceContent = `
    <div class="font-sans text-gray-800">
      <div class="flex justify-between items-center mb-6">
        <img src="${
									$("#logoPreview").attr("src") || ""
								}" alt="Logo" class="h-16 ml-8">
        <div class="text-right">
          <h1 class="text-2xl font-bold">Invoice</h1>
          <p><strong>Invoice Number:</strong> ${
											$("#invoiceNumber").val() || "N/A"
										}</p>
          <p><strong>Invoice Date:</strong> ${
											$("#invoiceDate").val() || "N/A"
										}</p>
          <p><strong>Due Date:</strong> ${$("#dueDate").val() || "N/A"}</p>
        </div>
      </div>
      <hr>
      <div class="grid grid-cols-2 gap-4 mb-6 mt-6">
        <div>
          <h3 class="text-lg font-semibold">Bill By:</h3>
          <div class="bg-gray-100 p-4 rounded">${
											$("#billByText").html() || "No data available"
										}</div>
        </div>
        <div>
          <h3 class="text-lg font-semibold">Bill To:</h3>
          <div class="bg-gray-100 p-4 rounded">${
											$("#billToText").html() || "No data available"
										}</div>
        </div>
      </div>
      <table class="w-full border-collapse border border-gray-300 mb-6">
        <thead>
          <tr class="bg-gray-200">
            <th class="border border-gray-300 p-2 text-left">Item Name</th>
            <th class="border border-gray-300 p-2 text-right">Quantity</th>
            <th class="border border-gray-300 p-2 text-right">Unit Price</th>
            <th class="border border-gray-300 p-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${$(".item-row")
											.map(function () {
												const itemName = $(this).find(".nm").val();
												const qty = $(this).find(".qty").val() || "0";
												const price = $(this).find(".price").val() || "$0.00";
												const total = $(this).find(".total").val() || "$0.00";

												// Only include rows with a valid item name
												if (itemName && itemName.trim() !== "") {
													return `
                  <tr>
                    <td class="border border-gray-300 p-2">${itemName}</td>
                    <td class="border border-gray-300 p-2 text-right">${qty}</td>
                    <td class="border border-gray-300 p-2 text-right">${price}</td>
                    <td class="border border-gray-300 p-2 text-right">${total}</td>
                  </tr>
                `;
												}
												return ""; // Exclude rows with empty item names
											})
											.get()
											.join("")}
        </tbody>
      </table>
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div>
          <h3 class="text-lg font-semibold">Payment Information</h3>
          <p>${$("#paymentInfo").val() || "No data available"}</p>
          <h3 class="text-lg font-semibold mt-4">Terms and Conditions</h3>
          <p>${$("#terms").val() || "No data available"}</p>
          <h3 class="text-lg font-semibold mt-4">Notes</h3>
          <p>${$("#notes").val() || "No data available"}</p>
        </div>
        <div class="text-right">
          <div style="display: flex; justify-content: space-between;">
            <strong>Subtotal:</strong> <span>${
													$("#subtotal").val() || "$0.00"
												}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <strong>Tax:</strong> <span>${$("#tax").val() || "0%"}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <strong>Discount:</strong> <span>${
													$("#discount").val() || "0%"
												}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <strong>Shipping:</strong> <span>${
													$("#shipping").val() || "$0.00"
												}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <strong>Grand Total:</strong> <span>${
													$("#grandTotal").text() || "$0.00"
												}</span>
          </div>
        </div>
      </div>
    </div>
  `;

		$("#preview-content").html(invoiceContent);
		$("#preview-modal").removeClass("hidden");
	});

	$("#closePreview").on("click", function () {
		$("#preview-modal").addClass("hidden");
	});

	$("#downloadPDF").on("click", function () {
		const element = document.getElementById("preview-content");
		if (element) {
			// Create a new window for the preview content
			const newWindow = window.open("", "Invoice Preview");
			newWindow.document.write(`<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice</title>
          <link rel="stylesheet" href="output.css">
          <style>
            @media print {
              .no-print { display: none; }
              * {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          ${element.innerHTML}
          <footer class="no-print w-full text-center mt-4">
  					<button onclick="window.print()" class="mt-40 bg-green-600 hover:bg-green-700 active:scale-95 text-white text-lg font-semibold cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105 inline-block rounded-full px-4 py-2 sm:px-6 sm:py-2.5 md:px-8 md:py-3 shadow-md hover:shadow-xl"> Print </button>
					</footer>
        </body>
        </html>`);
			newWindow.document.close();

			// Set the document title dynamically
			newWindow.document.title = "Invoice Preview";

			// Wait for the new window to load before generating the PDF
			newWindow.onload = function () {
				const options = {
					margin: 1,
					filename: "invoice.pdf",
					image: { type: "jpeg", quality: 0.98 },
					html2canvas: { scale: 2, useCORS: true, logging: true, backgroundColor: null },
					jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
				};
				html2pdf()
					.set(options)
					.from(newWindow.document.body)
					.save()
					.then(() => {
						newWindow.close(); // Close the new window after PDF generation
					})
					.catch((error) => {
						console.error("Error during PDF generation:", error);
					});
			};
		} else {
			alert("Preview content tidak ditemukan!");
		}
	});
});
// Preview and Download Invoice END
