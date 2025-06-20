/**
 * @file script.js
 * @description Handles interactive functionalities for an invoice generator page,
 * including logo uploading, currency formatting, adding/removing line items,
 * calculating totals, managing modals for billing information, and generating
 * a PDF preview/download of the invoice.
 */

// Add Logo START
/**
 * Handles the change event for the logo upload input.
 * Reads the selected image file and displays a preview.
 * @param {Event} e - The change event object.
 */
document.getElementById("logoUpload").addEventListener("change", function (e) {
	const reader = new FileReader();
	reader.onload = function (event) {
		const preview = document.getElementById("logoPreview");
		preview.src = event.target.result; // Set the source of the preview image
		preview.classList.remove("hidden"); // Make the preview image visible
		const uploadText = document.getElementById("uploadText");
		uploadText.classList.add("hidden"); // Hide the "Select logo to upload" text
	};
	reader.readAsDataURL(e.target.files[0]); // Read the selected file as a data URL
});
// Add Logo END

// Auto Formatting Currency START
/**
 * Intl.NumberFormat instance for formatting numbers as USD currency.
 * @type {Intl.NumberFormat}
 */
const priceFormat = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
	minimumFractionDigits: 2,
});

/**
 * Event listener for input events on elements with the class '.price'.
 * Automatically formats the input value as currency.
 */
$(document).on("input", ".price", function () {
	// Get the current value and remove any non-numeric characters
	let value = $(this)
		.val()
		.replace(/[^0-9]/g, "");
	if (value) {
		// If there's a value, parse it as a float (divided by 100 to treat as cents)
		let number = parseFloat(value) / 100;
		// Format the number as currency and update the input field's value
		$(this).val(priceFormat.format(number));
	} else {
		// If the value is empty, set the input field's value to an empty string
		$(this).val("");
	}
	// Recalculate totals whenever a price input changes
	calculateTotals();
});

/**
 * Formats the display of total and subtotal fields as currency.
 * This function is intended to be called after calculations that might change these values.
 */
function formatTotalsDisplay() {
	// Format total for each item row
	$(".total").each(function () {
		let val = parseFloat($(this).val()) || 0;
		$(this).val(priceFormat.format(val));
	});

	// Format subtotal
	let subtotalVal = parseFloat($("#subtotal").val()) || 0;
	$("#subtotal").val(priceFormat.format(subtotalVal));
}

/**
 * Event listener for input events on the '#shipping' input field.
 * Automatically formats the input value as currency.
 */
$(document).on("input", "#shipping", function () {
	// Get the current value and remove any non-numeric characters
	let value = $(this)
		.val()
		.replace(/[^0-9]/g, "");
	if (value) {
		// If there's a value, parse it as a float (divided by 100 to treat as cents)
		let number = parseFloat(value) / 100;
		// Format the number as currency and update the input field's value
		$(this).val(priceFormat.format(number));
	} else {
		// If the value is empty, set the input field's value to an empty string
		$(this).val("");
	}
	// Recalculate totals whenever the shipping input changes
	calculateTotals();
});

// Auto % on tax START
/**
 * Event listener for input events on the '#tax' input field.
 * Automatically appends a '%' symbol to the input value.
 */
$(document).on("input", "#tax", function () {
	// Get the current value and remove any characters that are not numbers or a decimal point
	let val = $(this)
		.val()
		.replace(/[^0-9.]/g, "");
	if (val !== "") {
		// If the value is not empty, append a '%' symbol
		$(this).val(val + "%");
	}
});
// Auto % on tax END

// Auto % on discount START
/**
 * Event listener for input events on the '#discount' input field.
 * Automatically appends a '%' symbol to the input value.
 */
$(document).on("input", "#discount", function () {
	// Get the current value and remove any characters that are not numbers or a decimal point
	let val = $(this)
		.val()
		.replace(/[^0-9.]/g, "");
	if (val !== "") {
		// If the value is not empty, append a '%' symbol
		$(this).val(val + "%");
	}
});
// Auto % on discount END
// Auto Formatting Currency END

// Add Item & Remove Item START
/**
 * Document ready function to handle adding and removing invoice items.
 */
$(document).ready(function () {
	/**
	 * Click event listener for the "⊕ Add Item" button.
	 * Adds a new item row to the invoice form.
	 */
	$('button:contains("⊕ Add Item")').click(function () {
		// Show delete checkboxes for all items
		$(".delete-checkbox").each((_, checkbox) => {
			$(checkbox).removeClass("hidden");
		});

		// Show the "Delete Selected" button
		$("#deleteSelected").removeClass("hidden");

		// HTML template for a new item row
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
		// Insert the new item row before the parent of the "Add Item" button
		$(this).parent().before(itemRow);
	});

	/**
	 * Click event listener for the "⊖ Delete Selected" button.
	 * Removes all selected item rows from the invoice form.
	 */
	$("#deleteSelected").click(function () {
		// Iterate over each checked delete-checkbox
		$(".delete-checkbox:checked").each(function () {
			// Remove the closest parent '.input-container' which wraps the item row
			$(this).closest(".input-container").remove();
		});
		// Recalculate totals after removing items
		calculateTotals();
	});
});
// Add Item & Remove Item END

// Total START
/**
 * Calculates the subtotal, tax, discount, shipping, and grand total for the invoice.
 * Updates the corresponding fields in the UI.
 */
function calculateTotals() {
	let subtotal = 0;

	// Calculate total for each item row
	$(".item-row").each(function () {
		const qty = parseFloat($(this).find(".qty").val()) || 0;
		// Get raw price string and clean it to get only numbers and decimal point
		const priceRaw = $(this).find(".price").val() || "0";
		const priceText = priceRaw.replace(/[^0-9.-]+/g, "");
		const price = parseFloat(priceText) || 0;
		const total = qty * price;

		// Set the formatted total value for the current item row
		$(this)
			.find(".total")
			.val(total.toLocaleString("en-US", { style: "currency", currency: "USD" }));
		subtotal += total; // Add to the overall subtotal
	});

	// Update subtotal field with formatted currency
	$("#subtotal").val(
		subtotal.toLocaleString("en-US", { style: "currency", currency: "USD" })
	);

	// Get tax rate, discount rate, and shipping cost
	const taxRate = parseFloat($("#tax").val()) || 0; // Assumes tax is entered as a percentage
	const discountRate = parseFloat($("#discount").val()) || 0; // Assumes discount is entered as a percentage
	const shipping =
		parseFloat(
			$("#shipping")
				.val()
				.replace(/[^0-9]/, "") // Clean shipping value to get only numbers
		) || 0;

	// Calculate amounts
	const taxAmount = subtotal * (taxRate / 100);
	const discountAmount = subtotal * (discountRate / 100);
	const grandTotal = subtotal + taxAmount - discountAmount + shipping;

	// Update grand total display with formatted currency
	$("#grandTotal").text(
		grandTotal.toLocaleString("en-US", { style: "currency", currency: "USD" })
	);
}

/**
 * Event listener for input events on quantity, tax, discount, and shipping fields.
 * Recalculates totals whenever these values change.
 */
$(document).on("input", ".qty, #tax, #discount, #shipping", calculateTotals);
// Total END

// Modal START
/**
 * Document ready function to handle modal toggling.
 */
$(document).ready(function () {
	/**
	 * Click event listener for elements with the 'data-modal-toggle' attribute.
	 * Toggles the visibility of the modal specified by the attribute's value.
	 */
	$("[data-modal-toggle]").on("click", function () {
		const modalId = $(this).data("modal-toggle"); // Get the ID of the modal to toggle
		const $modal = $("#" + modalId); // Select the modal element
		$modal.toggleClass("hidden"); // Toggle the 'hidden' class to show/hide the modal
	});
});
// Modal END

// Capture modal bill by data START
/**
 * Document ready function to handle capturing "Bill By" modal data.
 */
$(document).ready(function () {
	/**
	 * Click event listener for the '#add-by' button within the "Bill By" modal.
	 * Gathers data from the modal's input fields, formats it, and displays it
	 * in the main form. Then hides the modal.
	 */
	$("#add-by").on("click", function () {
		// Retrieve values from each input field in the "Bill By" modal
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

		// Construct the HTML string to display the collected "Bill By" information
		const displayText = `<p> ${userName} <br> ${userTin} <br> ${userAddress} <br> ${userAddressA} <br> ${userPostalCode} <br> ${userCity} <br> ${userDistrict} <br> ${userCountry} <br> ${userPhoneNumber} <br> ${userWebsite} <br> ${userEmail} </p>`;
		// Set the HTML content of the '#billByText' element on the main form
		$("#billByText").html(displayText);

		// Hide the "Bill By" modal
		$("#crud-modal-by").addClass("hidden");
	});
});
// Capture modal bill by data END

// Capture modal bill to data START
/**
 * Document ready function to handle capturing "Bill To" modal data.
 */
$(document).ready(function () {
	/**
	 * Click event listener for the '#add-to' button within the "Bill To" modal.
	 * Gathers data from the modal's input fields, formats it, and displays it
	 * in the main form. Then hides the modal.
	 */
	$("#add-to").on("click", function () {
		// Retrieve values from each input field in the "Bill To" modal
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

		// Construct the HTML string to display the collected "Bill To" information
		const displayText = `<p> ${clientName} <br> ${clientTin} <br> ${clientAddress} <br> ${clientAddressA} <br> ${clientPostalCode} <br> ${clientCity} <br> ${clientDistrict} <br> ${clientCountry} <br> ${clientPhoneNumber} <br> ${clientWebsite} <br> ${clientEmail} </p>`;
		// Set the HTML content of the '#billToText' element on the main form
		$("#billToText").html(displayText);

		// Hide the "Bill To" modal
		$("#crud-modal-to").addClass("hidden");
	});
});
// Capture modal bill to data END

// Preview and Download Invoice START
/**
 * Document ready function to handle invoice preview and PDF download.
 */
$(document).ready(function () {
	/**
	 * Click event listener for the '#previewPDF' button.
	 * Gathers all invoice data from the form, constructs an HTML preview,
	 * and displays it in a modal.
	 */
	$("#previewPDF").on("click", function () {
		// Construct the HTML content for the invoice preview
		const invoiceContent = `
		<div class="font-sans text-gray-800">
			<div class="flex justify-between items-center mb-6">
				<img src="${
									// Get logo source, or empty string if not set
									$("#logoPreview").attr("src") || ""
								}" alt="Logo" class="h-16 ml-8">
				<div class="text-right">
					<h1 class="text-2xl font-bold">Invoice</h1>
					<p><strong>Invoice Number:</strong> ${
											// Get invoice number, or "N/A" if empty
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
											// Get "Bill By" HTML content, or default text
											$("#billByText").html() || "No data available"
										}</div>
				</div>
				<div>
					<h3 class="text-lg font-semibold">Bill To:</h3>
					<div class="bg-gray-100 p-4 rounded">${
											// Get "Bill To" HTML content, or default text
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
					${// Map over each item row to generate table rows for the preview
						$(".item-row")
							.map(function () {
								const itemName = $(this).find(".nm").val();
								const qty = $(this).find(".qty").val() || "0";
								const price = $(this).find(".price").val() || "$0.00";
								const total = $(this).find(".total").val() || "$0.00";

								// Only include rows if an item name is present
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
								return ""; // Return empty string for rows without an item name
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
													// Get subtotal value, or default
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
													// Get grand total text, or default
													$("#grandTotal").text() || "$0.00"
												}</span>
					</div>
				</div>
			</div>
		</div>
	`;

		// Set the HTML content of the preview modal and display it
		$("#preview-content").html(invoiceContent);
		$("#preview-modal").removeClass("hidden");
	});

	/**
	 * Click event listener for the '#closePreview' button.
	 * Hides the invoice preview modal.
	 */
	$("#closePreview").on("click", function () {
		$("#preview-modal").addClass("hidden");
	});

	/**
	 * Click event listener for the '#downloadPDF' button.
	 * Generates a PDF from the preview content using html2pdf.js and initiates download.
	 */
	$("#downloadPDF").on("click", function () {
		const element = document.getElementById("preview-content");
		if (element) {
			// Create a new window to host the content for PDF generation.
			// This helps in isolating styles and ensuring accurate rendering.
			const newWindow = window.open("", "Invoice Preview");
			newWindow.document.write(`<!DOCTYPE html>
				<html lang="en">
				<head>
					<meta charset="UTF-8">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
					<title>Invoice</title>
					<link rel="stylesheet" href="output.css"> {/* Link to external stylesheet */}
					<style>
						@media print {
							.no-print { display: none; } /* Hide elements with .no-print class during printing */
							* {
								-webkit-print-color-adjust: exact; /* Ensure colors and backgrounds are printed correctly in WebKit browsers */
								print-color-adjust: exact; /* Standard property for printing colors and backgrounds */
							}
						}
					</style>
				</head>
				<body>
					${element.innerHTML} {/* Inject the preview content */}
					<footer class="no-print w-full text-center mt-4">
						<button onclick="window.print()" class="mt-40 bg-green-600 hover:bg-green-700 active:scale-95 text-white text-lg font-semibold cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105 inline-block rounded-full px-4 py-2 sm:px-6 sm:py-2.5 md:px-8 md:py-3 shadow-md hover:shadow-xl"> Print </button>
					</footer>
				</body>
				</html>`);
			newWindow.document.close(); // Close the document for writing

			// Set the title of the new window (useful for print preview)
			newWindow.document.title = "Invoice Preview";

			// Wait for the new window's content to fully load before generating the PDF
			newWindow.onload = function () {
				const options = {
					margin: 1, // PDF margin (in units specified by jsPDF.unit)
					filename: "invoice.pdf", // Name of the downloaded PDF file
					image: { type: "jpeg", quality: 0.98 }, // Image settings for PDF generation
					html2canvas: {
						scale: 2, // Scale for rendering, higher can improve quality
						useCORS: true, // Enable CORS for images if needed
						logging: true, // Enable html2canvas logging
						backgroundColor: null, // Use transparent background
					},
					jsPDF: {
						unit: "in", // Units for jsPDF (inches)
						format: "letter", // Paper format
						orientation: "portrait", // Page orientation
					},
				};
				// Use html2pdf library to generate and save the PDF
				html2pdf()
					.set(options) // Apply options
					.from(newWindow.document.body) // Source element for PDF generation
					.save() // Trigger download
					.then(() => {
						newWindow.close(); // Close the temporary window after PDF generation
					})
					.catch((error) => {
						console.error("Error during PDF generation:", error);
						// Optionally, close the window even if there's an error,
						// or provide user feedback.
						// newWindow.close();
					});
			};
		} else {
			// Alert if the preview content element is not found
			alert("Preview content tidak ditemukan!");
		}
	});
});
// Preview and Download Invoice END
