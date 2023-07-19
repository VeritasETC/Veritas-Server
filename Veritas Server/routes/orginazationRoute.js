import express from "express";
import {
    addEmployee,
    createOrginazation,
    getAllAttendances,
    getAllEmployee,
    getAllLeaveRequest,
    getAllPendingTransaction,
    getEmployeeGainedCurrentMonth,
    getEmployeeInformation,
    getOrginazationDetails,
    getTotalAmountPaidThisMonth,
    getUpcommingPayout,
    reviewWorkHourStatus,
    updateBusinessInformation,
    updateLeaveRequest,
    updateOrginazationOwner,
} from "../controllers/orginazationController.js";
import { isLoggedIn, isOrginazation } from "../middlewares/isLoggedIn.js";
const router = express.Router();

router.post("/auth/signup", createOrginazation);
router.post("/employee/add", isLoggedIn, addEmployee);
router.get("/employees", isLoggedIn, isOrginazation, getAllEmployee);
router.get(
    "/employee/info/:employeeID",
    isLoggedIn,
    isOrginazation,
    getEmployeeInformation
);
router.post(
    "/orginazation/owner",
    isLoggedIn,
    isOrginazation,
    updateOrginazationOwner
);
router.get(
    "/orginazation/details",
    isLoggedIn,
    isOrginazation,
    getOrginazationDetails
);
router.post(
    "/orginazation/business",
    isLoggedIn,
    isOrginazation,
    updateBusinessInformation
);

router.get(
    "/orginazation/employee/count",
    isLoggedIn,
    isOrginazation,
    getEmployeeGainedCurrentMonth
);

router.get(
    "/orginazation/transaction/amount/paid",
    isLoggedIn,
    isOrginazation,
    getTotalAmountPaidThisMonth
);
router.get(
    "/orginazation/transactions/pending/all",
    isLoggedIn,
    isOrginazation,
    getAllPendingTransaction
);

router.get(
    "/orginazation/upcomming/payout",
    isLoggedIn,
    isOrginazation,
    getUpcommingPayout
);

router.get(
    "/orginazation/employees/attendances",
    isLoggedIn,
    isOrginazation,
    getAllAttendances
);
router.post(
    "/orginazation/employee/attendance/update",
    isLoggedIn,
    isOrginazation,
    reviewWorkHourStatus
);

router.post(
    "/employee/attendance/leaves/request",
    isLoggedIn,
    getAllLeaveRequest
);
router.patch(
    "/employee/attendance/leave/update",
    isLoggedIn,
    isOrginazation,
    updateLeaveRequest
);
export default router;
