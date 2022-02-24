/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import { ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import store from "../__mocks__/store";
import { bills } from "../fixtures/bills";
import { ROUTES_PATH } from "../constants/routes.js";

import router from "../app/Router.js";

describe("Given I am connected as an Employee", () => {
	// Test for BillsUI.js
	describe("When I am on Bills page, there are a bill icon in vertical layout", async () => {
		test("Then, the icon should be highlighted", async () => {
			Object.defineProperty(window, "localStorage", { value: localStorageMock });
			window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
				})
			);
			const root = document.createElement("div");
			root.setAttribute("id", "root");
			document.body.append(root);
			router();
			window.onNavigate(ROUTES_PATH.Bills);
			await waitFor(() => screen.getByTestId("icon-window"));
			const windowIcon = screen.getByTestId("icon-window");
			const isIconActivated = windowIcon.classList.contains("active-icon");
			expect(isIconActivated).toBeTruthy();
		});
		describe("When I am on Bills page, there are a title and a newBill button", () => {
			test("Then, the title and the button should be render correctly", () => {
				const html = BillsUI({ data: [] });
				document.body.innerHTML = html;

				expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
				expect(screen.getByTestId("btn-new-bill")).toBeTruthy();
			});
		});
		describe("When I am on Bills page, there are 4 bills", () => {
			test("Then, bills data should be render 4 type, name, date, amount, status and eye icon", () => {
				const html = BillsUI({ data: bills });
				document.body.innerHTML = html;

				const bill = screen.getAllByTestId("bill");
				const type = screen.getAllByTestId("type");
				const name = screen.getAllByTestId("name");
				const date = screen.getAllByTestId("date");
				const amount = screen.getAllByTestId("amount");
				const status = screen.getAllByTestId("status");
				const iconEye = screen.getAllByTestId("icon-eye");

				expect(bill.length).toBe(4);
				expect(type.length).toBe(4);
				expect(name.length).toBe(4);
				expect(date.length).toBe(4);
				expect(amount.length).toBe(4);
				expect(status.length).toBe(4);
				expect(iconEye.length).toBe(4);
			});
		});
		describe("When I am on Bills page, there are bills", () => {
			test("Then, first bill data should contain the right type, name, date, amount, status and eye icon", () => {
				const html = BillsUI({ data: bills });
				document.body.innerHTML = html;

				const bill = screen.getAllByTestId("bill");
				const type = screen.getAllByTestId("type")[0];
				const name = screen.getAllByTestId("name")[0];
				const date = screen.getAllByTestId("date")[0];
				const amount = screen.getAllByTestId("amount")[0];
				const status = screen.getAllByTestId("status")[0];
				const iconEye = screen.getAllByTestId("icon-eye")[0];

				expect(bill.length).toBe(4);
				expect(type.textContent).toBe("Hôtel et logement");
				expect(name.textContent).toBe("encore");
				expect(date.textContent).toBe("2004-04-04");
				expect(amount.textContent).toBe("400 €");
				expect(status.textContent).toBe("pending");
				expect(iconEye.textContent).toBeTruthy();
			});
		});
		describe("When I am on Bills page, there are 4 bills", () => {
			test("Then, bills should be ordered from earliest to latest", () => {
				document.body.innerHTML = BillsUI({ data: bills });

				const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map((a) => a.innerHTML);
				const antiChrono = (a, b) => (a < b ? 1 : -1);
				const datesSorted = [...dates].sort(antiChrono);

				expect(dates).toEqual(datesSorted);
			});
		});
		describe("When I am on Bills page, and there are no bills", () => {
			test("Then, no bills should be shown", () => {
				const html = BillsUI({ data: [] });
				document.body.innerHTML = html;

				const bill = screen.queryByTestId("bill");
				expect(bill).toBeNull();
			});
		});
		describe("When I am on Bills page, but it is loading", () => {
			test("Then, Loading page should be rendered", () => {
				const html = BillsUI({ loading: true });
				document.body.innerHTML = html;
				expect(screen.getAllByText("Loading...")).toBeTruthy();
			});
		});
		describe("When I am on Dashboard page but back-end send an error message", () => {
			test("Then, Error page should be rendered", () => {
				const html = BillsUI({ error: "some error message" });
				document.body.innerHTML = html;
				expect(screen.getAllByText("Erreur")).toBeTruthy();
			});
		});
	});
});

// Test for Bills.js
describe("Given I am connected as Employee and I am on Bill page, there are bills", () => {
	describe("When clicking on an eye icon", () => {
		test("Then, modal should open and have a title and a file url", () => {
			Object.defineProperty(window, "localStorage", { value: localStorageMock });
			window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
				})
			);
			const html = BillsUI({ data: bills });
			document.body.innerHTML = html;
			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};
			const store = null;
			const bill = new Bills({
				document,
				onNavigate,
				store,
				localStorage: window.localStorage,
			});

			const modale = document.getElementById("modaleFile");
			$.fn.modal = jest.fn(() => modale.classList.add("show"));

			const eye = screen.getAllByTestId("icon-eye")[0];
			const handleClickIconEye = jest.fn(bill.handleClickIconEye(eye));

			eye.addEventListener("click", handleClickIconEye);
			userEvent.click(eye);
			expect(handleClickIconEye).toHaveBeenCalled();

			expect(modale.classList).toContain("show");

			expect(screen.getByText("Justificatif")).toBeTruthy();
			expect(bills[0].fileUrl).toBeTruthy();
		});
	});
});
describe("Given I am connected as Employee and I am on Bill page, there are a newBill button", () => {
	describe("When clicking on newBill button", () => {
		test("Then, bill form should open", () => {
			Object.defineProperty(window, "localStorage", { value: localStorageMock });
			window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
				})
			);
			const html = BillsUI({ data: [] });
			document.body.innerHTML = html;
			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};
			const store = null;
			const bill = new Bills({
				document,
				onNavigate,
				store,
				localStorage: window.localStorage,
			});

			const handleClickNewBill = jest.fn(() => bill.handleClickNewBill());
			screen.getByTestId("btn-new-bill").addEventListener("click", handleClickNewBill);
			userEvent.click(screen.getByTestId("btn-new-bill"));
			expect(handleClickNewBill).toHaveBeenCalled();
			expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
		});
	});
});

// Test d'intégration GET
describe("Given I am a user connected as Employee", () => {
	describe("When I navigate to Bill", () => {
		test("Then, fetches bills from mock API GET", async () => {
			const getSpy = jest.spyOn(store, "get");
			const bills = await store.get();
			expect(getSpy).toHaveBeenCalledTimes(1);
			expect(bills.data.length).toBe(4);
		});
		test("Then, fetches bills from an API and fails with 404 message error", async () => {
			store.get.mockImplementationOnce(() => Promise.reject(new Error("Erreur 404")));
			const html = BillsUI({ error: "Erreur 404" });
			document.body.innerHTML = html;
			const message = await screen.getByText(/Erreur 404/);
			expect(message).toBeTruthy();
		});
		test("Then, fetches messages from an API and fails with 500 message error", async () => {
			store.get.mockImplementationOnce(() => Promise.reject(new Error("Erreur 500")));
			const html = BillsUI({ error: "Erreur 500" });
			document.body.innerHTML = html;
			const message = await screen.getByText(/Erreur 500/);
			expect(message).toBeTruthy();
		});
	});
});
