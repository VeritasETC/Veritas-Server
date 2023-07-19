import express from "express";
const router = express.Router();

import { isLoggedIn, isOrginazation } from "../middlewares/isLoggedIn.js";
import {
    getAllMyTransactions,
    getAllTransactions,
    getMonthlyTransactions,
    getTotalTransactions,
    getTransaction,
    saveTransaction,
} from "../controllers/transactionController.js";

router.get(
    "/employee/:employeeId/transactions",
    isLoggedIn,
    getAllTransactions
);
router.post(
    "/employee/:employeeId/transactions",
    isLoggedIn,
    isOrginazation,
    saveTransaction
);
router.post(
    "/employee/transactions/total",
    isLoggedIn,
    isOrginazation,
    getTotalTransactions
);

router.post(
    "/employee/transactions/monthly",
    isLoggedIn,
    getMonthlyTransactions
);

router.post("/employee/transaction", isLoggedIn, getTransaction);
router.get("/employee/transactions/my", isLoggedIn, getAllMyTransactions);
export default router;
