/**
 * Ports layer (master spec Section 5.2): interface contracts that expose only
 * domain types (never Firestore `DocumentSnapshot`, `Timestamp`, or SDK types).
 *
 * The minimum port set — AuthService, SessionService, ProfileRepository,
 * VerificationRepository, DiscoveryRepository, ConnectionRequestRepository,
 * MatchRepository, ChatRepository, BlockRepository, ReportRepository,
 * NotificationService, StorageService, AppConfigRepository, AdminRepository —
 * is defined in each feature's approved work unit, not in this scaffold.
 */
export {};
