/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import {bills} from "../fixtures/bills.js";
import {ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import Bills from "../containers/Bills";
import userEvent from "@testing-library/user-event";

describe("Given I am connected as an employee", () => {
  // window.localStorage permet d'accéder aux données stockées des sessions du navigateur sans date d'expiration.
  Object.defineProperty(window, "localStorage", {value: localStorageMock});
  window.localStorage.setItem("user", JSON.stringify({type: "Employee"}));
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async() => {
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      // s'attendre à ce que la classe active-icon soit vraie
      expect(windowIcon.getElementsByClassName("active-icon")).toBeTruthy();
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({data: bills});
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML);
      const antiChrono = (a, b) => ((a < b) ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });

    test(("Then I click on the 'New Bill' button, I am redirected to the 'New Bill' page."), () => {
      document.body.innerHTML = BillsUI({data: bills});
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({pathname});
      };
      const billImpl = new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage
      });

      // récupérer l'élément "btn-new-bill" par l'attribut "data-testid"
      const btnNewBill = screen.getByTestId("btn-new-bill");
      const handleBtnNewBill = jest.fn(() => billImpl.handleClickNewBill());
      btnNewBill.addEventListener("click", handleBtnNewBill);
      userEvent.click(btnNewBill);
      // s'assurer que la fonction bien "handleBtnNewBill" était handleClickEye a été appelée
      expect(handleBtnNewBill).toHaveBeenCalled();
      // s'attendre à ce que le text "Envoyer une note de frais" soit vraie
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
    });

    test(("Then I click on the eye icon button, a modal should open"), () => {
      document.body.innerHTML = BillsUI({data: bills});
      const billImpl = new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage
      });

      // récupérer le premier élément "icon-eye" par l'attribut "data-testid"
      const iconEye = screen.getAllByTestId("icon-eye")[0];
      const handleIconEye = jest.fn(() => billImpl.handleClickIconEye(iconEye));
      iconEye.addEventListener("click", handleIconEye);
      // simulation des interactions du navigateur
      userEvent.click(iconEye);

      // s'assurer que la fonction "handleIconEye" bien était "handleIconEye" a été appelée
      expect(handleIconEye).toHaveBeenCalled();
      // s'attendre à ce que la classe avec l'id modaleFile soit vraie
      expect(document.getElementById("modaleFile")).toBeTruthy();
    });

  });
});
