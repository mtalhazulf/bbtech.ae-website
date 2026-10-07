export default `<tr>
	<td style="background-color:{{theme.navy}};padding:28px 32px;text-align:center;color:{{theme.footerText}};font-size:12px;font-family:{{theme.fontStack}};line-height:1.6;" role="presentation">
		<p style="margin:0 0 8px;">Binary Bridge Technology Services</p>
		<p style="margin:0 0 8px;">{{facts.addressHQ}}</p>
		<p style="margin:0 0 8px;">
			<a href="tel:{{facts.phonePrimary.tel}}" style="color:{{theme.footerLink}};text-decoration:none;">{{facts.phonePrimary.display}}</a>
			&nbsp;&middot;&nbsp;
			<a href="mailto:{{facts.emailPrimary}}" style="color:{{theme.footerLink}};text-decoration:none;">{{facts.emailPrimary}}</a>
		</p>
		<p style="margin:0;">&copy; {{year}} Binary Bridge Technology Services. All rights reserved.</p>
	</td>
</tr>
`;
