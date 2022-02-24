/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import store from "../__mocks__/store";
import BillsUI from "../views/BillsUI.js";

describe("Given I am connected as an employee", () => {
	describe("hen I am on NewBill page, there are a form", () => {
		test("Then, all the form input should be render correctly", () => {
			const html = NewBillUI();
			document.body.innerHTML = html;

			const formNewBill = screen.getByTestId("form-new-bill");
			const type = screen.getAllByTestId("expense-type");
			const name = screen.getAllByTestId("expense-name");
			const date = screen.getAllByTestId("datepicker");
			const amount = screen.getAllByTestId("amount");
			const vat = screen.getAllByTestId("vat");
			const pct = screen.getAllByTestId("pct");
			const commentary = screen.getAllByTestId("commentary");
			const file = screen.getAllByTestId("file");
			const submitBtn = document.querySelector("#btn-send-bill");

			expect(formNewBill).toBeTruthy();
			expect(type).toBeTruthy();
			expect(name).toBeTruthy();
			expect(date).toBeTruthy();
			expect(amount).toBeTruthy();
			expect(vat).toBeTruthy();
			expect(pct).toBeTruthy();
			expect(commentary).toBeTruthy();
			expect(file).toBeTruthy();
			expect(submitBtn).toBeTruthy();

			expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
		});
	});
	describe("When I am on NewBill page, and a user upload a accepted format file", () => {
		test("Then, the file name should be correctly displayed into the input and isImgFormatValid shoud be true", () => {
			window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
				})
			);

			const html = NewBillUI();
			document.body.innerHTML = html;

			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};
			const store = null;

			const newBill = new NewBill({
				document,
				onNavigate,
				store,
				localStorage,
			});
			const handleChangeFile = jest.fn(() => newBill.handleChangeFile);
			const file = screen.getByTestId("file");

			window.alert = jest.fn();

			file.addEventListener("change", handleChangeFile);
			fireEvent.change(file, {
				target: {
					files: [new File(["file.png"], "file.png", { type: "image/png" })],
				},
			});

			jest.spyOn(window, "alert");
			expect(alert).not.toHaveBeenCalled();

			expect(handleChangeFile).toHaveBeenCalled();
			expect(file.files[0].name).toBe("file.png");
			expect(newBill.fileName).toBe("file.png");
			expect(newBill.isImgFormatValid).toBe(true);
			expect(newBill.formData).not.toBe(null);
		});
	});
	describe("When I am on NewBill page, and a user upload a unaccepted format file", () => {
		test("Then, the file name should not be displayed into the input, isImgFormatValid shoud be false and a alert should be displayed", () => {
			window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
				})
			);

			const html = NewBillUI();
			document.body.innerHTML = html;

			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};
			const store = null;

			const newBill = new NewBill({ document, onNavigate, store, localStorage });
			const handleChangeFile = jest.fn(newBill.handleChangeFile);
			const file = screen.getByTestId("file");

			window.alert = jest.fn();

			file.addEventListener("change", handleChangeFile);
			fireEvent.change(file, {
				target: {
					files: [new File(["file.pdf"], "file.pdf", { type: "file/pdf" })],
				},
			});

			jest.spyOn(window, "alert");
			expect(alert).toHaveBeenCalled();

			expect(handleChangeFile).toHaveBeenCalled();
			expect(newBill.fileName).toBe(null);
			expect(newBill.isImgFormatValid).toBe(false);
			expect(newBill.formData).toBe(undefined);
		});
	});

	describe("When I am on NewBill page, and the user click on submit button", () => {
		test("Then, the handleSubmit function should be called", () => {
			window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
				})
			);

			const html = NewBillUI();
			document.body.innerHTML = html;

			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};

			const store = {
				bills: jest.fn(() => newBill.store),
				create: jest.fn(() => Promise.resolve({})),
			};

			const newBill = new NewBill({ document, onNavigate, store, localStorage });

			newBill.isImgFormatValid = true;

			const formNewBill = screen.getByTestId("form-new-bill");
			const handleSubmit = jest.fn(newBill.handleSubmit);
			formNewBill.addEventListener("submit", handleSubmit);
			fireEvent.submit(formNewBill);

			expect(handleSubmit).toHaveBeenCalled();
		});
	});
});

//POST
describe("When I navigate to Dashboard employee", () => {
	test("Add a bill from mock API POST", async () => {
		const postSpy = jest.spyOn(store, "post");
		const bill = {
			id: "47qAXb6fIm2zOKkLzMro",
			vat: "80",
			fileUrl: "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
			status: "accepted",
			type: "Hôtel et logement",
			commentAdmin: "ok",
			commentary: "séminaire billed",
			name: "encore",
			fileName: "preview-facture-free-201801-pdf-1.jpg",
			date: "2004-04-04",
			amount: 400,
			email: "a@a",
			pct: 20,
		};
		const bills = await store.post(bill);
		expect(postSpy).toHaveBeenCalledTimes(1);
		expect(bills.data.length).toBe(5);
	});
	test("Add bills from an API and fails with 404 message error", async () => {
		store.post.mockImplementationOnce(() => Promise.reject(new Error("Erreur 404")));
		const html = BillsUI({ error: "Erreur 404" });
		document.body.innerHTML = html;
		const message = await screen.getByText(/Erreur 404/);
		expect(message).toBeTruthy();
	});
	test("Add bill from an API and fails with 500 message error", async () => {
		store.post.mockImplementationOnce(() => Promise.reject(new Error("Erreur 500")));
		const html = BillsUI({ error: "Erreur 500" });
		document.body.innerHTML = html;
		const message = await screen.getByText(/Erreur 500/);
		expect(message).toBeTruthy();
	});
});
