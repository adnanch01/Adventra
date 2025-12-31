// UC04 – Activity Management Tests
// Sprint 5 – Aventra Group 9

const request = require("supertest");
const app = require("../server");

describe("UC04 – Activity Management", 
() => {

    // ---------------------------
    // TC06 – Add Activity
    // ---------------------------
    test("TC06: Add activity 
successfully", async () => {
        const res = await request(app)
            .post("/api/activities/add")
            .send({
                name: "Shibuya Crossing 
Night Walk",
                date: "2025-12-12",
                time: "19:00"
            });

        
expect(res.statusCode).toBe(201);
    });

    // ---------------------------
    // TC07 – Past Date
    // ---------------------------
    test("TC07: Reject past date", async 
() => {
        const res = await request(app)
            .post("/api/activities/add")
            .send({
                name: "Old Event",
                date: "2020-01-01",
                time: "10:00"
            });

        
expect(res.statusCode).toBe(400);
    });

    // ---------------------------
    // TC08 – Time Conflict
    // ---------------------------
    test("TC08: Detect time conflict", 
async () => {
        await request(app)
            .post("/api/activities/add")
            .send({
                name: "Museum Visit",
                date: "2025-12-15",
                time: "14:00"
            });

        const res = await request(app)
            .post("/api/activities/add")
            .send({
                name: "Tea Ceremony",
                date: "2025-12-15",
                time: "14:30"
            });

        
expect(res.statusCode).toBe(400);
    });

    // ---------------------------
    // TC09 – Edit Activity
    // ---------------------------
    test("TC09: Edit activity 
successfully", async () => {
        const created = await 
request(app)
            .post("/api/activities/add")
            .send({
                name: "Temple Visit",
                date: "2025-12-16",
                time: "10:00"
            });

        const id = 
created.body.activity_id;

        const updated = await 
request(app)
            
.put(`/api/activities/${id}`)
            .send({
                name: "Temple Visit 
Updated",
                time: "11:00"
            });

        
expect(updated.statusCode).toBe(200);
    });

    // ---------------------------
    // TC10 – Missing Fields
    // ---------------------------
    test("TC10: Missing required 
fields", async () => {
        const res = await request(app)
            .post("/api/activities/add")
            .send({
                name: "",
                date: "2025-12-17",
                time: "08:00"
            });

        
expect(res.statusCode).toBe(400);
    });

    // ---------------------------
    // TC11 – Delete Activity
    // ---------------------------
    test("TC11: Delete activity", async 
() => {
        const created = await 
request(app)
            .post("/api/activities/add")
            .send({
                name: "Delete Me",
                date: "2025-12-18",
                time: "09:00"
            });

        const id = 
created.body.activity_id;

        const deleted = await 
request(app)
            
.delete(`/api/activities/${id}`);

        
expect(deleted.statusCode).toBe(200);
    });

    // ---------------------------
    // TC12 – Duplicate Activity
    // ---------------------------
    test("TC12: Prevent duplicate 
activity", async () => {

        await request(app)
            .post("/api/activities/add")
            .send({
                name: "Tokyo Tower 
Visit",
                date: "2025-12-20",
                time: "15:00"
            });

        const res = await request(app)
            .post("/api/activities/add")
            .send({
                name: "Tokyo Tower 
Visit",
                date: "2025-12-20",
                time: "15:00"
            });

        
expect(res.statusCode).toBe(400);
    });
});

