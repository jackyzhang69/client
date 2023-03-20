import { ElementHandle, KeyInput, Page } from 'puppeteer'
import { showMessage, decode } from './utils'
import { ActArgs, Message, Action } from './definition'
import { PROD, DEFAULT_SPEED } from "./config"

export interface ElementProperties {
	action_type: string
	id?: string
}

export interface PressKeyElementProperties extends ElementProperties {
	key: KeyInput
	label: string
}

export interface ContinueElementProperties extends ElementProperties {
	message: string
}

export interface GotoPageElementProperties extends ElementProperties {
	url: string
	wait_for?: string
}

export interface PdfElementProperties extends ElementProperties {
	waitting_for?: string
}

export interface ImgElementProperties extends ElementProperties {
	waitting_for: string
}

export interface WaitElementProperties extends ElementProperties {
	duration: number
}

export interface SecurityElementProperties extends ElementProperties {
	portal?: string
	question_element_id: string
	answer_element_id: string
	security_answers: object
}

export interface LoginElementProperties extends ElementProperties {
	label: string
	portal?: string
	account: string
	password: string
	account_element_id: string
	password_element_id: string
}


export interface UploadElementProperties extends ElementProperties {
	label: string
	filename: string
	delay?: number
}


export interface InputElementProperties extends ElementProperties {
	label: string
	value: string
	length?: number
	required: boolean
	disabled: boolean
	delay?: number
	set_value?: boolean	//	if true, use js set value 
}

export interface AreatextElementProperties extends InputElementProperties {
	delay?: number
}

export interface SelectElementProperties extends ElementProperties {
	label: string
	value: string
	delay?: number
	select_by_text?: string
}

export interface CheckboxElementProperties extends ElementProperties {
	label: string
	value: boolean
	delay?: number
}

// Radio element
export interface RadioElementProperties extends ElementProperties {
	label: string
	delay?: number
}

export interface ButtonElementProperties extends ElementProperties {
	label: string
	delay?: number
}

export abstract class FormElement {
	protected action_type: string
	protected label: string
	constructor(action_type: string, label: string) {
		this.action_type = action_type
		this.label = label
	}
	abstract act(args: ActArgs): void

	showMessageAndExit(msg: string | null, exit_on_error: boolean) {
		showMessage(this, Message.ERROR, msg)
		exit_on_error && process.exit(1)
	}
}


export class PressKeyElement extends FormElement {
	private props: PressKeyElementProperties

	constructor(arg_props: PressKeyElementProperties) {
		super(arg_props.action_type, arg_props.label)
		this.props = arg_props
	}
	async act(args: ActArgs) {
		await args.page.keyboard.press(this.props.key)
	}

}


export class InputElement extends FormElement {
	private props: InputElementProperties

	constructor(arg_props: InputElementProperties) {
		super(arg_props.action_type, arg_props.label)
		this.props = arg_props
	}

	async act(args: ActArgs) {
		if (args.verbose) {
			showMessage(
				this,
				Message.LOG,
				`Filling input field "${this.props.label}" with value "${this.props.value}"`
			)
		}

		// Check if the input text is longer than the input text lmimitation. If does, trim with the limitation length;
		// If lenth is null or undefined, do nothing.
		if (
			this.props.length &&
			this.props.value &&
			this.props.value.length > this.props.length
		) {
			showMessage(
				this,
				Message.WARNING,
				`The input text is longer than input text limitation(${this.props.length}), so the rest part will be trimmed. `
			)
			this.props.value = this.props.value.slice(0, this.props.length)
		}
		// if the input is required but with no value, then quit
		this.props.required &&
			!this.props.value &&
			this.showMessageAndExit(
				`The "${this.props.label}" is required, but you do not have value`,
				args.exit_on_error
			)

		await args.page.waitForSelector(this.props.id as string)
		try {
			// check if disabled
			const disabled = await args.page.evaluate(id => {
				let input: HTMLInputElement = document.querySelector(id)
				return input.disabled
			}, this.props.id as string)

			// if text area is disabled and field is required , exit, otherwise type in value
			if (disabled && this.props.required) {
				this.showMessageAndExit(
					`"${this.props.label}" is disabled but value is required.`,
					args.exit_on_error
				)
			} else if (!disabled) {
				const input = (await args.page.$(
					this.props.id as string
				)) as ElementHandle
				// remove existing text contents
				await args.page.evaluate(id => {
					const input = document.querySelector(id) as HTMLInputElement
					input.value = ''
				}, this.props.id as string)
				// type in new contents, but if null, then do nothing
				if (this.props.set_value) {  // direct set the value 
					this.props.value && await args.page.evaluate((id, value) => {
						document.querySelector(id).value = value;
					}, this.props.id!, this.props.value);
				} else {  // type in 
					this.props.value && await input.type(this.props.value, { delay: this.props.delay ? this.props.delay : DEFAULT_SPEED.input })
				}

				args.verbose &&
					showMessage(
						this,
						Message.SUCCESS,
						`Successfully entered "${this.props.value}"`
					)
			}
		} catch (err) {
			err instanceof Error &&
				this.showMessageAndExit(err.message, args.exit_on_error)
		}
	}
}


export class SelectElement extends FormElement {
	private props: SelectElementProperties

	constructor(arg_props: SelectElementProperties) {
		super(arg_props.action_type, arg_props.label)
		this.props = arg_props
	}

	// return a list of values of the select options
	async option_values(args: ActArgs) {
		return await args.page.evaluate(
			id =>
				Array.from(
					document.querySelector(id).options as HTMLOptionsCollection
				).map(option => (option as HTMLOptionElement).value),
			this.props.id as string
		)
	}

	// return a list of text of the select options
	async option_texts(args: ActArgs) {
		const select = await args.page.evaluate(
			id =>
				Array.from(
					document.querySelector(id).options as HTMLOptionsCollection
				).map(option => (option as HTMLOptionElement).text),
			this.props.id as string
		)
		return select
	}

	// get value by text
	async get_value(text: string, args: ActArgs) {
		return await args.page.evaluate((id, text) => {
			const options = document.querySelector(id).options as HTMLOptionsCollection
			for (var option of options) {
				// option includes text is ok
				if (option.text.toLowerCase().includes(text.toLowerCase())) {
					return option.value
				}
			}
			return ""
		}, this.props.id as string, this.props.value as string)
	}

	async act(args: ActArgs) {
		args.verbose &&
			showMessage(
				this,
				Message.LOG,
				`Selecting field "${this.props.label}" with value "${this.props.value}"`
			)
		!this.props.value &&
			this.showMessageAndExit(
				`No value to select the dropdown menu`,
				args.exit_on_error
			)

		await args.page.waitForSelector(this.props.id as string)
		// if value not in dropdown list
		const values = await this.option_values(args)
		if (!values.includes(this.props.value)) {
			for (const value of values) {	// 有些动态产生的value中，前面的数字会变，但是包含的id数字不变，根据id确定value
				if (value.includes(this.props.value)) {
					this.props.value = value
				}
			}
		}

		// if text based select is required, get value as text and then get the real value
		if (this.props.select_by_text) {
			this.props.value = await this.get_value(this.props.value, args)
		}

		try {
			await args.page.select(this.props.id as string, this.props.value);
			const delay = this.props.delay ? this.props.delay : DEFAULT_SPEED.select
			await args.page.waitForTimeout(delay)
			args.verbose &&
				showMessage(
					this,
					Message.SUCCESS,
					`Successfully selected "${this.props.value}"`
				)
		} catch (err) {
			err instanceof Error &&
				this.showMessageAndExit(err.message, args.exit_on_error)
		}
	}
}


export class CheckboxElement extends FormElement {
	private props: CheckboxElementProperties

	constructor(arg_props: CheckboxElementProperties) {
		super(arg_props.action_type, arg_props.label)
		this.props = arg_props
	}

	async act(args: ActArgs) {
		args.verbose &&
			showMessage(this, Message.LOG, `Clicking checkbox "${this.props.label}"`)

		await args.page.waitForSelector(this.props.id as string)
		try {
			await args.page.evaluate((selector, should_check) => {
				// only if the checkbox is not check, then click it 
				if (document.querySelector(selector).checked != should_check) {
					return should_check && document.querySelector(selector).click()
				}
			}, this.props.id as string, this.props.value)
			await args.page.waitForTimeout(this.props.delay ? this.props.delay : DEFAULT_SPEED.checkbox)
			args.verbose &&
				showMessage(
					this,
					Message.SUCCESS,
					`Successfully checked the checkbox "${this.props.label}"`
				)
		} catch (err) {
			err instanceof Error &&
				this.showMessageAndExit(err.message, args.exit_on_error)
		}
	}
}


// A group of radio button,and only one will be checked
export class RadioElement extends FormElement {
	private props: RadioElementProperties

	constructor(arg_props: RadioElementProperties) {
		super(arg_props.action_type, arg_props.label)
		this.props = arg_props
	}

	async act(args: ActArgs) {
		args.verbose &&
			showMessage(
				this,
				Message.LOG,
				`Clicking radio button "${this.props.label}"`
			)

		await args.page.waitForSelector(this.props.id as string)
		try {
			// https://stackoverflow.com/questions/57939222/puppeteer-throws-error-with-node-not-visible
			// reason
			await args.page.evaluate(selector => {
				return document.querySelector(selector).click()
			}, this.props.id as string)
			// delay a while
			await args.page.waitForTimeout(this.props.delay ? this.props.delay : DEFAULT_SPEED.radio)
			args.verbose &&
				showMessage(
					this,
					Message.SUCCESS,
					`Successfully checked the radio button "${this.props.label}"`
				)
		} catch (err) {
			err instanceof Error &&
				this.showMessageAndExit(err.message, args.exit_on_error)
		}
	}
}


export class AreatextElement extends InputElement { }


export class ButtonElement extends FormElement {
	private props: ButtonElementProperties

	constructor(arg_props: ButtonElementProperties) {
		super(arg_props.action_type, arg_props.label)
		this.props = arg_props
	}

	async act(args: ActArgs) {
		if (args.verbose) {
			showMessage(
				this,
				Message.LOG,
				`Processing button click for "${this.props.label}."`
			)
		}
		await args.page.waitForSelector(this.props.id as string)
		try {
			// check if disabled
			const disabled = await args.page.evaluate(id => {
				let btn: HTMLButtonElement = document.querySelector(id)
				return btn.disabled
			}, this.props.id as string)
			// if text area is disabled, exit, otherwise type in value
			disabled
				? this.showMessageAndExit(
					`"${this.props.label}" is disabled.`,
					args.exit_on_error
				)
				: await args.page.click(this.props.id as string, { delay: this.props.delay ? this.props.delay : DEFAULT_SPEED.button })

			args.verbose &&
				showMessage(
					this,
					Message.SUCCESS,
					`Successfully clicked the button "${this.props.label}".`
				)
		} catch (err) {
			err instanceof Error &&
				this.showMessageAndExit(err.message, args.exit_on_error)
		}
	}
}

export class PdfElement {
	private props: PdfElementProperties

	constructor(arg_props: PdfElementProperties) {
		this.props = arg_props
	}

	async act(args: ActArgs) {
		// make a snapshot
		if (args.snapshot && args.mode == PROD) {
			const url = await args.page.url();
			const spliter = url.includes('https') ? 'https://' : 'http://'
			const pdfname = url.split(spliter)[1].replace(/\//g, '-') + ".pdf"
			const filename = args.path + "/" + pdfname;

			this.props.waitting_for && await args.page.waitForSelector(this.props.waitting_for!);
			await args.page.pdf({ path: filename, printBackground: true });
			showMessage(this, Message.SUCCESS, `Successfully created ${filename}.`)
		}
	}
}

export class ImgElement {
	private props: ImgElementProperties

	constructor(arg_props: ImgElementProperties) {
		this.props = arg_props
	}

	async act(args: ActArgs) {
		// make a snapshot
		if (args.snapshot && args.mode == PROD) {
			const url = await args.page.url();
			const spliter = url.includes('https') ? 'https://' : 'http://'
			const imgname = url.split(spliter)[1].replace(/\//g, '-') + ".png"
			const filename = args.path + "/" + imgname;

			await args.page.waitForSelector(this.props.waitting_for);
			await args.page.screenshot({ path: filename, fullPage: true });
			showMessage(this, Message.SUCCESS, `Successfully created ${filename}.`)
		}
	}
}


export class UploadElement extends FormElement {
	private props: UploadElementProperties

	constructor(arg_props: UploadElementProperties) {
		super(arg_props.action_type, arg_props.label)
		this.props = arg_props
	}

	async act(args: ActArgs) {
		if (args.verbose) {
			showMessage(
				this,
				Message.LOG,
				`Processing upload file for "${this.props.label}."`
			)
		}

		await args.page.waitForSelector(this.props.id as string)
		try {
			const [file_chooser] = await Promise.all([
				args.page.waitForFileChooser(),
				args.page.click(this.props.id as string),
			])
			await file_chooser.accept([this.props.filename])
			args.verbose &&
				showMessage(
					this,
					Message.SUCCESS,
					`Successfully uploaded "${this.props.filename}" for "${this.props.label}".`
				)
		} catch (err) {
			err instanceof Error &&
				this.showMessageAndExit(err.message, args.exit_on_error)
		}
	}
}


export class GotoPageElement {
	private props: GotoPageElementProperties
	constructor(arg_props: GotoPageElementProperties) {
		this.props = arg_props
	}
	async act(args: ActArgs) {
		Promise.all([
			await args.page.goto(this.props.url, { waitUntil: 'networkidle0' }),
			this.props.wait_for && await args.page.waitForSelector(this.props.wait_for)
		])
	}
}


export class LoginElement extends FormElement {
	private props: LoginElementProperties

	constructor(arg_props: LoginElementProperties) {
		super(arg_props.action_type, arg_props.label)
		this.props = arg_props
	}
	set_credentials(account: string, password: string) {
		this.props.account = account
		this.props.password = password
	}
	async act(args: ActArgs) {
		await args.page.type(this.props.account_element_id, this.props.account);
		await args.page.type(this.props.password_element_id, this.props.password);
	}
}


export class SecurityElement {
	private props: SecurityElementProperties

	constructor(arg_props: SecurityElementProperties) {
		this.props = arg_props
	}
	set_security_answers(answers: string) {
		this.props.security_answers = JSON.parse(answers)
	}
	async act(args: ActArgs) {
		// Handle security questions

		const question = await args.page.$eval(
			this.props.question_element_id,
			el => el.textContent
		)
		console.log(question)
		for (const [keyword, value] of Object.entries(
			this.props.security_answers
		)) {
			if (question && question.includes(keyword)) {
				//输入问题答案
				const answer_element = await args.page.$(this.props.answer_element_id)
				answer_element && (await answer_element.type(value))
				console.log(question + ': ' + value)
				// //点击确定按钮进行登录
				// let continue_button = await args.page.$(this.props.continue_element_id)
				// //等待页面跳转完成，一般点击某个按钮需要跳转时，都需要等待 this.page.waitForNavigation() 执行完毕才表示跳转成功
				// await Promise.all([
				// 	continue_button && continue_button.click(),
				// 	args.page.waitForNavigation(),
				// 	// args.page.waitForSelector(this.props.success_element_id),
				// ])
				// showMessage(
				// 	this,
				// 	Message.SUCCESS,
				// 	'Security Answer successfully, and loged in...'
				// )
			}
		}
	}
}

export class ConfirmElement {
	private props: ContinueElementProperties

	constructor(arg_props: ContinueElementProperties) {
		this.props = arg_props
	}

	async act(args: ActArgs) {
		const answer = await args.page.evaluate(async (msg) => {
			let inside_confrim = confirm(msg);
			return inside_confrim;
		}, this.props.message);
		if (!answer) process.exit(0)
	}
}

export class Wait4Element {
	private props: ElementProperties

	constructor(arg_props: ElementProperties) {
		this.props = arg_props
	}

	async act(args: ActArgs) {
		await args.page.waitForSelector(this.props.id!)
	}
}