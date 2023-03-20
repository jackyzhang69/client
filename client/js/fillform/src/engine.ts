import {
	ElementProperties,
	InputElementProperties,
	AreatextElementProperties,
	SelectElementProperties,
	CheckboxElementProperties,
	RadioElementProperties,
	ButtonElementProperties,
	UploadElementProperties,
	GotoPageElementProperties,
	SecurityElementProperties,
	WaitElementProperties,
	PdfElementProperties,
	ContinueElementProperties,
	LoginElementProperties,
	PressKeyElementProperties,
} from './element'

import {
	FormElement,
	InputElement,
	SelectElement,
	CheckboxElement,
	RadioElement,
	AreatextElement,
	ButtonElement,
	UploadElement,
	GotoPageElement,
	SecurityElement,
	PdfElement,
	ConfirmElement,
	LoginElement,
	PressKeyElement
} from './element'
import { DependantSelect, DependantSelectProperties } from './dependantselect'
import { RepeatElmentProperties, RepeatElement } from './repeatsection'
import { Page } from 'puppeteer'
import { ActArgs, Action } from './definition'
import { PrPortalPicker, PrPortalPickerProperties } from './portals/prportalpickclient'
import { BcpnpPick, BcpnpPickProperties } from "./portals/bcpnppick"
import { LmiaEmployerPickProperties, LmiaEmployerPick } from "./portals/lmia"

require('dotenv').config({ path: '~/.immenv' })

export async function fillForm(
	page: Page,
	data: ElementProperties[],
	aa: ActArgs
) {
	for (const node of data) {
		switch (node.action_type) {
			case Action.Radio:
				const radio = new RadioElement(node as RadioElementProperties)
				await radio.act(aa)
				break
			case Action.Checkbox:
				const cb = new CheckboxElement(node as CheckboxElementProperties)
				await cb.act(aa)
				break
			case Action.Select:
				const s = new SelectElement(node as SelectElementProperties)
				await s.act(aa)
				break
			case Action.DependantSelect:
				const ds = new DependantSelect(node as DependantSelectProperties)
				await ds.act(aa)
				break
			case Action.Input:
				const input = new InputElement(node as InputElementProperties)
				await input.act(aa)
				break
			case Action.Areatext:
				const areatext = new AreatextElement(node as AreatextElementProperties)
				await areatext.act(aa)
				break
			case Action.Button:
				const button = new ButtonElement(node as ButtonElementProperties)
				await button.act(aa)
				break
			case Action.RepeatSection:
				const rep = new RepeatElement(node as RepeatElmentProperties)
				await rep.act(aa)
				break
			case Action.Upload:
				const upload = new UploadElement(node as UploadElementProperties)
				await upload.act(aa)
				break
			case Action.GotoPage:
				const go2page = new GotoPageElement(node as GotoPageElementProperties)
				await go2page.act(aa)
				break
			case Action.Security:
				const security = new SecurityElement(node as SecurityElementProperties)
				// Hack hack
				if ((node as SecurityElementProperties).portal == "lmia") {
					var sa = aa.rcic + "_lmiaportal_sequrity_answers"
					sa = process.env[sa]!
					security.set_security_answers(sa)
				}
				await security.act(aa)
				break
			case Action.Login:
				const login = new LoginElement(node as LoginElementProperties)
				// Hack hack
				if ((node as LoginElementProperties).portal == "lmia") {
					var account = aa.rcic + "_lmiaportal_account"
					var psw = aa.rcic + "_lmiaportal_password"
					account = process.env[account]!
					psw = process.env[psw]!
					if (account == undefined || psw == undefined) {
						console.log(`Please check .immenv for account and password of RCIC ${aa.rcic}`)
						process.exit(0)
					}
					login.set_credentials(account, psw)
				}
				else if ((node as LoginElementProperties).portal == "prportal") {
					var account = aa.rcic + "_prportal_account"
					var psw = aa.rcic + "_prportal_password"
					account = process.env[account]!
					psw = process.env[psw]!
					if (account == undefined || psw == undefined) {
						console.log(`Please check .immenv for account and password of RCIC ${aa.rcic}`)
						process.exit(0)
					}
					login.set_credentials(account, psw)
				} else {
					account = (node as LoginElementProperties).account
					psw = (node as LoginElementProperties).password
					let buff = Buffer.from(psw, 'base64');
					psw = buff.toString('ascii');
					login.set_credentials(account, psw)
				}
				await login.act(aa)
				break
			case Action.Wait:
				console.log(`Wait for ${(node as WaitElementProperties).duration / 1000} seconds. `)
				await aa.page.waitForTimeout((node as WaitElementProperties).duration)
				break;
			case Action.Pdf:
				const pdf = new PdfElement(node as PdfElementProperties)
				await pdf.act(aa)
				break
			case Action.Continue:
				const ctn = new ConfirmElement(node as ContinueElementProperties)
				await ctn.act(aa)
				break
			case Action.PressKey:
				const pk = new PressKeyElement(node as PressKeyElementProperties)
				await pk.act(aa)
				break
			case Action.PrPortalPick:	// for prportal only
				const ppp = new PrPortalPicker(node as PrPortalPickerProperties)
				await ppp.act(aa)
				break
			case Action.BcpnpPick:	// for bcpnp only
				const bp = new BcpnpPick(node as BcpnpPickProperties)
				await bp.act(aa)
				break
			case Action.LmiaEmployerPick:	// for lmia only
				const lmiaemp = new LmiaEmployerPick(node as LmiaEmployerPickProperties)
				await lmiaemp.act(aa)
				break
		}
	}
}
