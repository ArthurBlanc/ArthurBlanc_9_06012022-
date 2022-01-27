import { screen } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import store from "../__mocks__/store";

describe("Given I am connected as an employee", () => {
	// Test for billsUI.js
	describe("When I am on Bills Page", () => {
		test("Then bill icon in vertical layout should be highlighted", () => {
			window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
				})
			);
			const html = BillsUI({ data: [] });
			document.body.innerHTML = html;
			expect(document.querySelector("#layout-icon1").classList.contains("active-icon"));
		});
		test("Then bills should be ordered from earliest to latest", () => {
			const html = BillsUI({ data: bills });
			document.body.innerHTML = html;
			const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map((a) => a.innerHTML);
			const antiChrono = (a, b) => (a < b ? 1 : -1);
			const datesSorted = [...dates].sort(antiChrono);
			expect(dates).toEqual(datesSorted);
		});
	});
	// Test d'intégration GET
	describe("When I navigate to Bill", () => {
		test("fetches bills from mock API GET", async () => {
			const getSpy = jest.spyOn(store, "get");
			const bills = await store.get();
			expect(getSpy).toHaveBeenCalledTimes(1);
			expect(bills.data.length).toBe(4);
		});
		test("fetches bills from an API and fails with 404 message error", async () => {
			store.get.mockImplementationOnce(() => Promise.reject(new Error("Erreur 404")));
			const html = BillsUI({ error: "Erreur 404" });
			document.body.innerHTML = html;
			const message = await screen.getByText(/Erreur 404/);
			expect(message).toBeTruthy();
		});
		test("fetches messages from an API and fails with 500 message error", async () => {
			store.get.mockImplementationOnce(() => Promise.reject(new Error("Erreur 500")));
			const html = BillsUI({ error: "Erreur 500" });
			document.body.innerHTML = html;
			const message = await screen.getByText(/Erreur 500/);
			expect(message).toBeTruthy();
		});
	});
});
