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
import mockStore from "../__mocks__/store.js";

describe("Given I am connected as an employee", () => {

  beforeEach(() => {
    // Permet d'accéder aux données stockées des sessions du navigateur sans date d'expiration.
    Object.defineProperty(window, "localStorage", {value: localStorageMock});
    window.localStorage.setItem("user", JSON.stringify({type: "Employee"}));
  });

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
      // s'assurer que la fonction "handleBtnNewBill" a été appelée
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

      // s'assurer que la fonction "handleIconEye" a été appelée
      expect(handleIconEye).toHaveBeenCalled();
      // s'attendre à ce que la classe avec l'id modaleFile soit vraie
      expect(document.getElementById("modaleFile")).toBeTruthy();
    });
  });

  // TEST INTÉGRATION GET
  describe("When I navigate to the bills", () => {

    //  Récupère les factures à partir de l'API mocker.
    beforeEach(() => {
      jest.spyOn(mockStore, "bills");
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();
    });

    test("get the bills from a mock API GET", async() => {
      //  jest.spyOn(obj, 'functionName') instanciés pour simuler une fonction.
      const spyInstance = jest.spyOn(mockStore, "bills");
      const billList = await mockStore.bills().list();
      // assurer que fonction simulée "spyInstance" a été appelée 1 fois
      expect(spyInstance).toHaveBeenCalledTimes(1);
      // vérifier que la longueur du tableau et égale a 4
      expect(billList.length).toBe(4);
    });

    test("Get bills from API, fails with an error message 404", async() => {
      document.body.innerHTML = BillsUI({error: "Erreur 404"});
      expect(await screen.getByText(/Erreur 404/)).toBeTruthy();
    });

    test("Get bills from API, fails with an error message 500", async() => {
      document.body.innerHTML = BillsUI({error: "Erreur 500"});
      expect(await screen.getByText(/Erreur 500/)).toBeTruthy();
    });
  });
});
