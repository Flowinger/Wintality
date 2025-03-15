"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestSession = void 0;
var functions = __importStar(require("firebase-functions"));
var admin = __importStar(require("firebase-admin"));
if (admin.apps.length === 0) {
    admin.initializeApp();
}
var db = admin.firestore();
exports.createTestSession = functions.https.onCall(function (request) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, sessionName, athleteIds, testSchema_1, sessionData, sessionRef, error_1, errorMessage;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                console.log("Received request:", request.data);
                _a = request.data, sessionName = _a.sessionName, athleteIds = _a.athleteIds;
                if (!sessionName || !athleteIds || athleteIds.length === 0) {
                    console.error("❌ Missing parameters:", { sessionName: sessionName, athleteIds: athleteIds });
                    throw new functions.https.HttpsError("invalid-argument", "Missing required parameters.");
                }
                console.log("✅ Creating session with athletes:", athleteIds);
                testSchema_1 = {
                    body_height: null,
                    body_mass: null,
                    fat_free_mass: null,
                    body_fat_percentage: null,
                    arm_span: null,
                    leg_length_left: null,
                    leg_length_right: null,
                    sit_and_reach_try1: null,
                    sit_and_reach_try2: null,
                    jump_and_reach_counter_movement: null,
                    jump_and_reach_standing_reach: null,
                    jump_and_reach_running: null,
                    counter_movement_try1: null,
                    counter_movement_try2: null,
                    counter_movement_try3: null,
                    drop_jump_height_try1: null,
                    drop_jump_height_try2: null,
                    drop_jump_height_try3: null,
                    drop_jump_contact_try1: null,
                    drop_jump_contact_try2: null,
                    drop_jump_contact_try3: null,
                    squat_jump_try1: null,
                    squat_jump_try2: null,
                    squat_jump_try3: null,
                    sprint_5m_try1: null,
                    sprint_5m_try2: null,
                    sprint_5m_try3: null,
                    sprint_10m_try1: null,
                    sprint_10m_try2: null,
                    sprint_10m_try3: null,
                    sprint_30m_try1: null,
                    sprint_30m_try2: null,
                    sprint_30m_try3: null,
                    lane_agility: null,
                    yoyo_II: null,
                    y_balance_front_right_leg: null,
                    y_balance_front_left_leg: null,
                    y_balance_right_right_leg: null,
                    y_balance_right_left_leg: null,
                    y_balance_left_right_leg: null,
                    y_balance_left_left_leg: null,
                };
                sessionData = {
                    name: sessionName,
                    date: new Date().toISOString(),
                    athletes: athleteIds,
                    tests: athleteIds.reduce(function (acc, athleteId) {
                        acc[athleteId] = __assign({}, testSchema_1);
                        return acc;
                    }, {}),
                };
                console.log("📝 Session data prepared:", sessionData);
                return [4 /*yield*/, db.collection("test_sessions").add(sessionData)];
            case 1:
                sessionRef = _b.sent();
                console.log("✅ Session successfully created:", sessionRef.id);
                return [2 /*return*/, { sessionId: sessionRef.id }];
            case 2:
                error_1 = _b.sent();
                console.error("❌ Error creating test session:", error_1);
                errorMessage = error_1 instanceof Error ? error_1.message : "Unknown error";
                throw new functions.https.HttpsError("internal", "🔥 Internal error: " + errorMessage);
            case 3: return [2 /*return*/];
        }
    });
}); });
