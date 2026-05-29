# ICT Home Pros Payment Program Roadmap

Current app version: 1.0

## Verified

1. The login page loads with the ICT Home Pros branding.
2. Admin login shows the Administration button.
3. Agreement and Disclosure buttons switch the document preview.
4. Save Draft works in the browser. It saves the current form values to localStorage and restores them after reloading the app and logging back in.

## Important Notes

1. The current Save Draft button does not save client documents into the Client_Agreements folder yet.
2. Client_Agreements is intended for customer documents created by the installed/running app, not for GitHub source-code storage.
3. The financing agreement and disclosure language must be reviewed by a Kansas attorney before real client use.
4. The future update system should notify users when a new program version is available without uploading private client documents to GitHub.

## Next Build Steps

1. Refine the financing agreement text so it reads like a complete retail installment financing agreement.
2. Refine the separate disclosure page with full Kansas and federal disclosure sections.
3. Add real client/document saving so completed drafts can be stored under Client_Agreements.
4. Add a client list screen for opening, editing, and tracking saved clients.
5. Add administration settings for users, business information, agreement numbering, default terms, and update controls.
6. Improve print/export so the agreement and disclosure can be printed or exported as a polished packet.

## Recommended Next Step

Build real client/document saving next. The browser draft test works, but the app still needs a proper save system that creates client records and document files in Client_Agreements.
