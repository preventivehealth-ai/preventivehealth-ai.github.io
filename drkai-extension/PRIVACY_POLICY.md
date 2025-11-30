# Privacy Policy for DrKai Browser Extension

**Last Updated:** November 30, 2025

## Overview

DrKai - AI Lifestyle Assistant ("the Extension") is a browser extension developed by Preventive Health AI that enables healthcare professionals to generate AI-powered responses to lifestyle questions directly from their browser.

This Privacy Policy describes how we collect, use, and protect information when you use our Extension.

## Information We Collect

### Information You Provide
- **Question Text**: When you use the Extension to ask a question, the text you select or type is sent to our servers for processing.
- **Authentication Data**: We use Google OAuth to authenticate you with your existing DrKai account.

### Information We Do NOT Collect
- **Patient Health Information (PHI)**: The Extension is designed to NOT store or persist any patient health information. Questions are processed in real-time and not retained.
- **Browsing History**: We do not track which websites you visit.
- **Personal Files**: We do not access your local files or documents.

## How We Use Your Information

- **Generate AI Responses**: Your questions are processed by our AI system to generate relevant lifestyle answers.
- **Authentication**: To verify your identity and link to your DrKai AI Avatar for personalized responses.
- **Service Improvement**: Aggregate, anonymized usage statistics may be used to improve our service.

## Data Storage and Security

- **Session-Only Storage**: Authentication tokens are stored only in browser session storage and are cleared when you close your browser.
- **Encrypted Transmission**: All data is transmitted using TLS 1.3 encryption.
- **No Local Persistence**: The Extension does not persist any question or answer data locally.
- **HIPAA Compliance**: Our backend systems are designed with HIPAA compliance in mind. We do not store PHI in any identifiable form.

## Third-Party Services

- **Google OAuth**: Used for authentication. Subject to [Google's Privacy Policy](https://policies.google.com/privacy).
- **OpenAI/Anthropic**: AI models may be used for answer generation. Data is processed according to our enterprise agreements which prohibit training on customer data.

## Your Rights

You have the right to:
- **Access**: Request information about what data we process about you.
- **Delete**: Request deletion of your account and associated data.
- **Opt-out**: Stop using the Extension at any time by uninstalling it.

## Data Retention

- **Authentication Tokens**: Deleted when browser session ends or on logout.
- **Server Logs**: API request logs are retained for 30 days for debugging purposes, then deleted.
- **Account Data**: Managed through your main DrKai account.

## Children's Privacy

The Extension is not intended for use by anyone under the age of 18. We do not knowingly collect personal information from children.

## Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of any changes by updating the "Last Updated" date.

## Contact Us

If you have questions about this Privacy Policy, please contact us at:

**Preventive Health AI**
Email: privacy@preventivehealth.ai
Website: https://preventivehealth.ai

## Permissions Explained

The Extension requests the following permissions:

| Permission | Why We Need It |
|------------|----------------|
| `storage` | Store authentication tokens in session storage |
| `contextMenus` | Add "Ask DrKai" to right-click menu |
| `activeTab` | Read selected text from the current page |
| `identity` | Google OAuth authentication |
