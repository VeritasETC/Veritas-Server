import express from "express";
import {
    employeeClockIn,
    employeeClockOut,
    getAllMyLeaves,
    getLoggedInEmployeeInfo,
    getMyAttendances,
    getPrevMonthPay,
    getTotalWorkTime,
    getWorkStatus,
    getWorkTime,
    leaveRequest,
    setEmployeePassword,
    setMyWorkHour,
    updateEmployeeInformation,
} from "../controllers/employeeController.js";
import { isLoggedIn, isOrginazation } from "../middlewares/isLoggedIn.js";
import { getAllAttendances } from "../controllers/orginazationController.js";
const router = express.Router();

router.post("/employee/set/password/new", setEmployeePassword);
router.put("/employee/update", isLoggedIn, updateEmployeeInformation);
router.get("/employee/info", isLoggedIn, getLoggedInEmployeeInfo);
router.post("/employees/clock-in", isLoggedIn, employeeClockIn);
router.post("/employees/clock-out", isLoggedIn, employeeClockOut);
router.post("/employees/leave-request", isLoggedIn, leaveRequest);
router.get("/employee/total-work-time", isLoggedIn, getTotalWorkTime);
router.get("/employee/work-time", isLoggedIn, getWorkTime);
router.get("/employee/work-time/status", isLoggedIn, getWorkStatus);
router.post("/employee/work/set", isLoggedIn, setMyWorkHour);
router.get("/employee/attendances/my", isLoggedIn, getMyAttendances);
router.get("/employee/leaves/all", isLoggedIn, getAllMyLeaves);
router.get("/employee/pay/previous", isLoggedIn, getPrevMonthPay);

export default router;
