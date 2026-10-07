export default `New enquiry: {{formLabel}}, {{name}}
Submitted {{formatDate submittedAt}} from {{pageUrl}}

{{#each fields}}
{{this.label}}: {{this.value}}
{{/each}}

Message:
{{message}}

Reply to {{name}}: {{replyMailto}}
`;
