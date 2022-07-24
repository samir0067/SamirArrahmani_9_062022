/**
 * @jest-environment jsdom
 */
import NewBillUI from "../views/NewBillUI.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import NewBill from "../containers/NewBill.js";
import {fireEvent, screen} from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import {ROUTES} from "../constants/routes.js";
import mockStore from "../__mocks__/store";

describe("Given I am connected as an employee", () => {

  beforeEach(() => {
    // Permet d'accéder aux données stockées des sessions du navigateur sans date d'expiration.
    Object.defineProperty(window, "localStorage", {value: localStorageMock});
    window.localStorage.setItem("user", JSON.stringify({type: "Employee"}));
    document.body.innerHTML = NewBillUI();
  });

  describe("When I am on NewBill Page", () => {
    test("Then the title should be displayed", () => {
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
    });
  });

  describe("When I complete the required fields and click on Submit", () => {
    test("Then I am redirected to the page of the bill, is it and submitted", async() => {
      const newBillFile = new File(["img"], "newBill.png", {type: "image/png"});
      console.log("newBillFile===", newBillFile.name);
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({pathname});
      };
      const newBillImpl = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      });

      const datepicker = screen.getByTestId("datepicker");
      fireEvent.change(datepicker, {target: {value: "2022-07-25"}});
      expect(datepicker.value).toBe("2022-07-25");

      const amount = screen.getByTestId("amount");
      fireEvent.change(amount, {target: {value: "500"}});
      expect(amount.value).toBe("500");

      const ptc = screen.getByTestId("pct");
      fireEvent.change(ptc, {target: {value: "50"}});
      expect(ptc.value).toBe("50");

      const file = screen.getByTestId("file");
      const handleBtnFile = jest.fn((e) => newBillImpl.handleChangeFile(e));
      file.addEventListener("change", handleBtnFile);
      userEvent.upload(file, newBillFile);
      expect(handleBtnFile).toHaveBeenCalled();
      expect(file.files).toHaveLength(1);
      expect(file.files[0]).toBe(newBillFile);
      expect(file.files.item(0)).toBe(newBillFile);

      const form = screen.getByTestId("form-new-bill");
      const handleSubmitNewBill = jest.fn((e) => newBillImpl.handleSubmit(e));
      form.addEventListener("submit", handleSubmitNewBill);
      fireEvent.submit(form);
      expect(handleSubmitNewBill).toHaveBeenCalled();

      await new Promise(process.nextTick);
      expect(screen.getByText("Mes notes de frais")).toBeTruthy();
      expect(screen.getByTestId("tbody")).toBeTruthy();
    });
  });
});
