#!/usr/bin/env python3
"""
End-to-end test script for document upload functionality
Tests all 6 document types: cv, cover_letter, id_document, certificate, reference, portfolio
"""

import requests
import os
import sys
from pathlib import Path

# Configuration
API_URL = "http://localhost:3000/api"
TEST_USER_EMAIL = "demo@writenow.com"
TEST_USER_PASSWORD = "Demo123!"

# ANSI color codes for output
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
RESET = "\033[0m"

def print_success(message):
    print(f"{GREEN}[OK] {message}{RESET}")

def print_error(message):
    print(f"{RED}[ERROR] {message}{RESET}")

def print_info(message):
    print(f"{BLUE}[INFO] {message}{RESET}")

def print_warning(message):
    print(f"{YELLOW}[WARN] {message}{RESET}")

def login():
    """Login and get JWT token"""
    print_info("Logging in...")
    response = requests.post(
        f"{API_URL}/auth/login",
        json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        }
    )

    if response.status_code != 200:
        print_error(f"Login failed: {response.text}")
        sys.exit(1)

    data = response.json()
    token = data.get("token")
    print_success(f"Logged in successfully as {TEST_USER_EMAIL}")
    return token

def create_test_pdf(file_path, size_kb=100):
    """Create a test PDF file"""
    content = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n"
    content += b"2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n"
    content += b"3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/Resources <<\n/Font <<\n/F1 4 0 R\n>>\n>>\n/Contents 5 0 R\n>>\nendobj\n"
    content += b"4 0 obj\n<<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n>>\nendobj\n"
    content += b"5 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(Test Document) Tj\nET\nendstream\nendobj\n"

    # Pad file to reach desired size
    padding_size = (size_kb * 1024) - len(content)
    if padding_size > 0:
        content += b"0" * padding_size

    content += b"xref\n0 6\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000115 00000 n\n"
    content += b"0000000239 00000 n\n0000000318 00000 n\ntrailer\n<<\n/Size 6\n/Root 1 0 R\n>>\nstartxref\n"
    content += b"408\n%%EOF\n"

    with open(file_path, 'wb') as f:
        f.write(content)

def upload_document(token, document_type, file_path, file_name):
    """Upload a document"""
    print_info(f"Uploading {document_type}: {file_name}...")

    with open(file_path, 'rb') as f:
        files = {
            'document': (file_name, f, 'application/pdf')
        }
        data = {
            'documentType': document_type,
            'isPrimary': 'true',
            'description': f'Test {document_type} document'
        }
        headers = {
            'Authorization': f'Bearer {token}'
        }

        response = requests.post(
            f"{API_URL}/profile/documents",
            files=files,
            data=data,
            headers=headers
        )

    if response.status_code == 201:
        result = response.json()
        doc = result.get('document', {})
        print_success(f"Uploaded {document_type}: {doc.get('documentName')} ({doc.get('fileSize')} bytes)")
        return True
    else:
        print_error(f"Failed to upload {document_type}: {response.status_code} - {response.text}")
        return False

def get_documents(token):
    """Get all documents"""
    print_info("Fetching all documents...")

    headers = {
        'Authorization': f'Bearer {token}'
    }

    response = requests.get(
        f"{API_URL}/profile/documents",
        headers=headers
    )

    if response.status_code == 200:
        data = response.json()
        documents = data.get('documents', [])
        print_success(f"Retrieved {len(documents)} documents")
        return documents
    else:
        print_error(f"Failed to get documents: {response.status_code} - {response.text}")
        return []

def delete_document(token, document_id, document_name):
    """Delete a document"""
    print_info(f"Deleting document: {document_name}...")

    headers = {
        'Authorization': f'Bearer {token}'
    }

    response = requests.delete(
        f"{API_URL}/profile/documents/{document_id}",
        headers=headers
    )

    if response.status_code == 200:
        print_success(f"Deleted document: {document_name}")
        return True
    else:
        print_error(f"Failed to delete document: {response.status_code} - {response.text}")
        return False

def main():
    print(f"\n{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}Document Upload End-to-End Test{RESET}")
    print(f"{BLUE}{'='*60}{RESET}\n")

    # Login
    token = login()
    print()

    # Create temp directory for test files
    temp_dir = Path("temp_test_files")
    temp_dir.mkdir(exist_ok=True)

    # Document types to test
    document_types = [
        ('cv', 'test-cv.pdf', 200),
        ('cover_letter', 'test-cover-letter.pdf', 150),
        ('id_document', 'test-id.pdf', 300),
        ('certificate', 'test-certificate.pdf', 250),
        ('reference', 'test-reference.pdf', 180),
        ('portfolio', 'test-portfolio.pdf', 400)
    ]

    # Test results
    upload_results = {}

    print(f"{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}Testing Document Uploads{RESET}")
    print(f"{BLUE}{'='*60}{RESET}\n")

    # Create and upload test files
    for doc_type, file_name, size_kb in document_types:
        file_path = temp_dir / file_name
        create_test_pdf(file_path, size_kb)
        success = upload_document(token, doc_type, file_path, file_name)
        upload_results[doc_type] = success
        print()

    print(f"{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}Verifying Uploaded Documents{RESET}")
    print(f"{BLUE}{'='*60}{RESET}\n")

    # Verify documents were uploaded
    documents = get_documents(token)
    print()

    # Group by type
    doc_by_type = {}
    for doc in documents:
        doc_type = doc['documentType']
        if doc_type not in doc_by_type:
            doc_by_type[doc_type] = []
        doc_by_type[doc_type].append(doc)

    # Display results
    print(f"{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}Test Results Summary{RESET}")
    print(f"{BLUE}{'='*60}{RESET}\n")

    all_passed = True
    for doc_type, _, _ in document_types:
        uploaded = upload_results.get(doc_type, False)
        verified = doc_type in doc_by_type and len(doc_by_type[doc_type]) > 0

        status = "PASS" if (uploaded and verified) else "FAIL"
        color = GREEN if status == "PASS" else RED

        print(f"{color}{status:6}{RESET} | {doc_type:15} | Upload: {uploaded} | In DB: {verified}")

        if status == "FAIL":
            all_passed = False

    print(f"\n{BLUE}{'='*60}{RESET}\n")

    # Cleanup test files
    print_info("Cleaning up test files...")
    for doc_type, file_name, _ in document_types:
        file_path = temp_dir / file_name
        if file_path.exists():
            file_path.unlink()
    temp_dir.rmdir()
    print_success("Cleanup complete")

    print()
    if all_passed:
        print_success("ALL TESTS PASSED!")
        sys.exit(0)
    else:
        print_error("SOME TESTS FAILED!")
        sys.exit(1)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n\n{YELLOW}Test interrupted by user{RESET}")
        sys.exit(1)
    except Exception as e:
        print_error(f"Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
