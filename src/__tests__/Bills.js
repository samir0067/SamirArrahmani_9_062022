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
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async() => {

      Object.defineProperty(window, "localStorage", {value: localStorageMock});
      window.localStorage.setItem("user", JSON.stringify({type: "Employee"}));
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
  });

  describe("When I click on the icon button eye", () => {
    test(("then a modal should open"), () => {
      // window.localStorage permet d'accéder aux données stockées des sessions du navigateur sans date d'expiration.
      Object.defineProperty(window, "localStorage", {value: localStorageMock});
      window.localStorage.setItem("user", JSON.stringify({type: "Employee"}));
      document.body.innerHTML = BillsUI({data: bills});

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({pathname});
      };
      const billImpl = new Bills({
        document,
        onNavigate,
        firestore: null,
        localStorage: window.localStorage
      });
      // Crée une fonction mock optionnelle, prend une implémentation mocked
      $.fn.modal = jest.fn();

      // récupérer le premier élément icon-eye par l'attribut data-testid
      const eye = screen.getAllByTestId("icon-eye")[0];
      const handleClickEye = jest.fn(() => billImpl.handleClickIconEye(eye));
      eye.addEventListener("click", handleClickEye);
      // simulation des interactions du navigateur
      userEvent.click(eye);

      // s'assurer que la fonction bien était handleClickEye a été appelée
      expect(handleClickEye).toHaveBeenCalled();
      expect(document.getElementById("modaleFile")).toBeTruthy();
    });
  });
});
