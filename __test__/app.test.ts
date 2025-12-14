import App from "../src/app";

describe("App", () => {
  let app: App;

  beforeAll(() => {
    app = new App();
  });

  describe("App Class", () => {
    it("should create an Express application instance", () => {
      expect(app.app).toBeDefined();
    });

    it("should be an Express application", () => {
      // Check that the app has typical Express properties
      expect(typeof app.app.use).toBe("function");
      expect(typeof app.app.get).toBe("function");
      expect(typeof app.app.post).toBe("function");
    });
  });

  describe("Server", () => {
    it("should have a start method", () => {
      expect(typeof app.start).toBe("function");
    });
  });
});
