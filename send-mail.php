<?php
/**
 * Jiufu Packaging - Contact Form Handler
 * 
 * Usage: Point your contact form's action to this file.
 * Deploy this file on any PHP-enabled hosting (cPanel, VPS, etc.)
 */

// ---- CONFIGURATION ----
$to_email = "wzjiufu@163.com";
$subject_prefix = "[Jiufu Website] ";

// ---- Security ----
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { 
    echo json_encode(['success' => false, 'message' => 'Method not allowed']); exit; 
}

// ---- Sanitize Input ----
function safe($val) { return htmlspecialchars(strip_tags(trim($val ?? ''))); }

$name    = safe($_POST['name'] ?? '');
$company = safe($_POST['company'] ?? '');
$email   = safe($_POST['email'] ?? '');
$phone   = safe($_POST['phone'] ?? '');
$product = safe($_POST['product'] ?? '');
$quantity= safe($_POST['quantity'] ?? '');
$material= safe($_POST['material'] ?? '');
$printing= safe($_POST['printing'] ?? '');
$message = safe($_POST['message'] ?? '');

// ---- Validate ----
$errors = [];
if (empty($name))  $errors[] = 'Name is required';
if (empty($email)) $errors[] = 'Email is required';
if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Invalid email format';
if (strlen($message) > 5000) $errors[] = 'Message too long (max 5000 chars)';

if (!empty($errors)) {
    echo json_encode(['success' => false, 'message' => implode(', ', $errors)]); exit;
}

// ---- Build Email ----
$subject = $subject_prefix . "New inquiry from " . $name . ($company ? " ($company)" : "");

$body = "=== NEW INQUIRY FROM JIUFU WEBSITE ===\n\n";
$body .= "Name: $name\n";
$body .= "Company: $company\n";
$body .= "Email: $email\n";
$body .= "Phone: $phone\n\n";
$body .= "--- Product Details ---\n";
$body .= "Product Interest: $product\n";
$body .= "Order Quantity: $quantity\n";
$body .= "Material: $material\n";
$body .= "Printing: $printing\n\n";
$body .= "--- Message ---\n";
$body .= $message ?: "(No additional message)\n";
$body .= "\n--- System Info ---\n";
$body .= "IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'N/A') . "\n";
$body .= "Time: " . date('Y-m-d H:i:s') . "\n";
$body .= "Source: " . ($_SERVER['HTTP_REFERER'] ?? 'Direct') . "\n";

$headers = [
    'From: ' . $email,
    'Reply-To: ' . $email,
    'X-Mailer: PHP/' . phpversion(),
    'Content-Type: text/plain; charset=UTF-8'
];

// ---- Send ----
$mail_sent = mail($to_email, $subject, $body, implode("\r\n", $headers));

if ($mail_sent) {
    echo json_encode(['success' => true, 'message' => 'Thank you! Your inquiry has been sent.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to send. Please try emailing us directly.']);
}
