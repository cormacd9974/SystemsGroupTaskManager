/**
 * FILE UPLOAD MIDDLEWARE CONFIGURATION
 * 
 * This module configures Multer middleware for handling file uploads in the
 * task management system. It implements secure file handling with type validation,
 * size limits, and organized storage to support document attachments, user avatars,
 * and other file-based features while maintaining security best practices.
 */

// THIRD-PARTY IMPORTS
import multer from "multer";                       // Multipart form data handling for file uploads
import path from "path";
import { fileURLToPath } from "url";                           // Node.js path utilities for file extension handling

/**
 * STORAGE CONFIGURATION
 * 
 * DISK STORAGE STRATEGY: Uses local disk storage for uploaded files with
 * organized directory structure and unique filename generation to prevent
 * conflicts and maintain file integrity across concurrent uploads.
 * 
 * DIRECTORY ORGANIZATION: Centralizes all uploads in a dedicated 'uploads/'
 * directory for easy backup, security scanning, and maintenance operations.
 * This approach simplifies file management and enables batch operations.
 * 
 * FILENAME UNIQUENESS: Implements timestamp-based naming to prevent filename
 * collisions while preserving original file extensions for proper file type
 * identification and client-side handling.
 * 
 * SCALABILITY CONSIDERATION: For production deployments, consider migrating
 * to cloud storage (AWS S3, Google Cloud Storage) for better scalability,
 * redundancy, and CDN integration.
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storage = multer.diskStorage({
    // DESTINATION CONFIGURATION: Define upload directory
    destination: (req, file, cb) => {
        // STORAGE LOCATION: Centralized uploads directory
        // SECURITY: Ensure this directory is outside web root in production
        // PERMISSIONS: Directory should have appropriate read/write permissions
        cb(null, path.join(__dirname, "uploads/"));
    },
    
    // FILENAME GENERATION: Create unique filenames to prevent conflicts
    filename: (req, file, cb) => {
        // UNIQUENESS STRATEGY: Use timestamp for collision-free naming
        // PERFORMANCE: Date.now() provides millisecond precision for uniqueness
        // ALTERNATIVE: Consider UUID for distributed systems or higher concurrency
        const unique = Date.now().toString();
        const sanitized = file.originalname.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9.\-_]/g, "");
        // FILENAME CONSTRUCTION: Preserve original extension for file type identification
        // FORMAT: {timestamp}.{original_extension}
        // EXAMPLE: 1640995200000.pdf, 1640995200001.jpg
        cb(null, unique + "-" + sanitized);
    },
});

/**
 * FILE TYPE VALIDATION
 * 
 * SECURITY IMPLEMENTATION: Whitelist-based file type validation prevents
 * malicious file uploads and ensures only business-appropriate file types
 * are accepted by the system.
 * 
 * BUSINESS REQUIREMENTS: Supports common document and image formats needed
 * for task management workflows including:
 * - Images: JPEG, PNG, GIF for screenshots, diagrams, user avatars
 * - Documents: PDF, DOC, DOCX for specifications, reports, contracts
 * - Data: XLSX, CSV for data imports, reports, analytics
 * - Text: TXT for logs, notes, configuration files
 * 
 * VALIDATION STRATEGY: Uses file extension checking as primary validation
 * method. For enhanced security, consider adding MIME type validation
 * and file content inspection (magic number checking).
 * 
 * ERROR HANDLING: Provides clear error messages for unsupported file types
 * to improve user experience and debugging capabilities.
 */
const fileFilter = ( req, file, cb) => {
    // ALLOWED FILE TYPES: Whitelist of acceptable file extensions
    // SECURITY: Restrictive list prevents executable file uploads
    // BUSINESS: Covers common task management document types
    const allowedExt = /jpeg|jpg|png|gif|pdf|doc|docx|xlsx|csv|txt/;
    
    // EXTENSION EXTRACTION AND VALIDATION
    // NORMALIZATION: Convert to lowercase for case-insensitive matching
    // VALIDATION: Test against allowed extensions regex pattern
    const ext = allowedExt.test(path.extname(file.originalname).toLocaleLowerCase());
    const allowedMime = [
        "image/jpeg","image/png", "image/gif", 
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/csv", "text/plain",
        "application/octet-stream"
    ];
    const mime = allowedMime.includes(file.mimetype);
    (ext && mime) ? cb(null, true) : cb(new Error("File type not supported"));
    // VALIDATION RESULT: Accept or reject file based on extension
}

/**
 * MULTER MIDDLEWARE EXPORT
 * 
 * CONFIGURATION INTEGRATION: Combines storage, filtering, and size limit
 * configurations into a single middleware instance for use across the application.
 * 
 * SIZE LIMITATION: Implements 10MB file size limit to prevent:
 * - Server resource exhaustion from large uploads
 * - Storage space abuse
 * - Network bandwidth consumption
 * - Poor user experience with slow uploads
 * 
 * USAGE PATTERNS: This middleware can be used in various ways:
 * - Single file: upload.single('fieldname')
 * - Multiple files: upload.array('fieldname', maxCount)
 * - Mixed fields: upload.fields([{name: 'field1'}, {name: 'field2'}])
 * 
 * INTEGRATION EXAMPLES:
 * - Task attachments: router.post('/tasks', upload.array('attachments', 5), createTask)
 * - User avatars: router.put('/profile/avatar', upload.single('avatar'), updateAvatar)
 * - Bulk imports: router.post('/import', upload.single('dataFile'), importData)
 */
export const upload = multer({ 
    storage,                                      // STORAGE: Disk storage configuration
    fileFilter,                                   // VALIDATION: File type filtering
    limits: { fileSize: 10 * 1024 * 1024}       // SIZE LIMIT: 10MB maximum file size
});

/**
 * SECURITY CONSIDERATIONS & BEST PRACTICES:
 * 
 * 1. FILE TYPE SECURITY:
 *    - Never trust file extensions alone - validate MIME types and file headers
 *    - Scan uploaded files for malware using antivirus integration
 *    - Consider file content inspection for additional security layers
 * 
 * 2. STORAGE SECURITY:
 *    - Store uploads outside the web root to prevent direct execution
 *    - Implement proper file permissions (read-only for web server)
 *    - Use separate storage volumes for uploaded content
 * 
 * 3. ACCESS CONTROL:
 *    - Implement authentication for file upload endpoints
 *    - Validate user permissions for file access and downloads
 *    - Log all file operations for audit trails
 * 
 * 4. PERFORMANCE OPTIMIZATION:
 *    - Implement file compression for large documents
 *    - Use CDN for file delivery in production
 *    - Consider async processing for large file operations
 * 
 * 5. MONITORING & MAINTENANCE:
 *    - Monitor disk usage and implement cleanup policies
 *    - Track upload patterns for capacity planning
 *    - Implement file lifecycle management (archival, deletion)
 * 
 * 6. PRODUCTION ENHANCEMENTS:
 *    - Migrate to cloud storage (S3, Google Cloud Storage)
 *    - Implement file deduplication to save storage space
 *    - Add image processing capabilities (resizing, optimization)
 *    - Implement virus scanning for uploaded files
 * 
 * 7. ERROR HANDLING:
 *    - Provide clear error messages for file validation failures
 *    - Implement retry mechanisms for failed uploads
 *    - Handle disk space exhaustion gracefully
 * 
 * 8. COMPLIANCE CONSIDERATIONS:
 *    - Implement data retention policies for uploaded files
 *    - Ensure GDPR compliance for user-uploaded content
 *    - Maintain audit logs for file access and modifications
 */