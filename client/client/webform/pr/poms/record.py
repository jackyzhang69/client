


    page.get_by_role("link", name="Continue").click()
    page.get_by_role("combobox", name="Province/Territory (required)").select_option("2: 11")
    page.get_by_role("combobox", name="City/Town (required)").select_option("437: 8205")
    page.get_by_role("button", name="Save and continue").click()
    page.get_by_role("group", name="Enter your full name exactly as shown on your passport or travel document. If there is only one name on your document, put it in the family name field and leave the given name field blank.").get_by_label("Family name(s) (required)").click()
    page.get_by_role("group", name="Enter your full name exactly as shown on your passport or travel document. If there is only one name on your document, put it in the family name field and leave the given name field blank.").get_by_label("Family name(s) (required)").fill("Ma")
    page.get_by_role("group", name="Enter your full name exactly as shown on your passport or travel document. If there is only one name on your document, put it in the family name field and leave the given name field blank.").get_by_label("Family name(s) (required)").press("Tab")
    page.get_by_role("group", name="Enter your full name exactly as shown on your passport or travel document. If there is only one name on your document, put it in the family name field and leave the given name field blank.").get_by_label("Given name(s)").fill("Yun")
    page.get_by_role("group", name="Enter your full name exactly as shown on your passport or travel document. If there is only one name on your document, put it in the family name field and leave the given name field blank.").get_by_label("Given name(s)").press("Tab")
    page.get_by_role("group", name="Have you ever used any other name (e.g. nickname, maiden name, alias, etc.)? (required)").get_by_text("No").click()
    page.get_by_role("group", name="Have you ever used any other name (e.g. nickname, maiden name, alias, etc.)? (required)").get_by_text("Yes").click()
    page.get_by_role("group", name="If yes, please provide the name (e.g. nickname, maiden name, alias, etc.)").get_by_label("Family name(s) (required)").click()
    page.get_by_role("group", name="If yes, please provide the name (e.g. nickname, maiden name, alias, etc.)").get_by_label("Family name(s) (required)").fill("May")
    page.get_by_role("group", name="If yes, please provide the name (e.g. nickname, maiden name, alias, etc.)").get_by_label("Family name(s) (required)").press("Tab")
    page.get_by_role("group", name="If yes, please provide the name (e.g. nickname, maiden name, alias, etc.)").get_by_label("Given name(s)").fill("Yun")
    page.get_by_label("UCI").click()
    page.locator("html").click()
    page.get_by_role("group", name="If yes, please provide the name (e.g. nickname, maiden name, alias, etc.)").get_by_label("Given name(s)").fill("Yun")
    page.get_by_label("UCI").click()
    page.get_by_label("UCI").fill("1221323213")
    page.locator("html").click()
    page.get_by_role("combobox", name="Eye colour (required)").select_option("2: 02")
    page.get_by_label("Height (in cm) (required)").click()
    page.get_by_label("Height (in cm) (required)").fill("177")
    page.get_by_role("group", name="Birth information").get_by_label("Date of birth (YYYY/MM/DD) (required)").click()
    page.locator("pra-localized-app").click()
    page.get_by_role("group", name="Birth information").get_by_label("Date of birth (YYYY/MM/DD) (required)").click()
    page.get_by_role("group", name="Birth information").get_by_label("Date of birth (YYYY/MM/DD) (required)").fill("1988/01/01")
    page.get_by_role("group", name="Birth information").get_by_label("Date of birth (YYYY/MM/DD) (required)").press("Tab")
    page.get_by_label("Place of birth (required)").fill("Nanjing")
    page.get_by_label("Place of birth (required)").press("Tab")
    page.get_by_role("combobox", name="Country of birth (required)").select_option("48: 721")
    page.get_by_role("group", name="Citizenship(s)").get_by_role("combobox", name="Country (required)").select_option("36: 721")
    page.get_by_role("combobox", name="Country", exact=True).select_option("2: 081")
    page.get_by_role("group", name="Current country of residence", exact=True).get_by_role("combobox", name="Country (required)").select_option("37: 155")
    page.get_by_role("combobox", name="Status (required)", exact=True).select_option("3: 03")
    page.get_by_label("From (YYYY/MM/DD) (required)").click()
    page.get_by_label("From (YYYY/MM/DD) (required)").fill("2020/01/01")
    page.get_by_label("From (YYYY/MM/DD) (required)").press("Tab")
    page.get_by_label("To (YYYY/MM/DD) (required)").fill("2024/01/01")
    page.get_by_role("group", name="Previous countries of residence: during the past five years, have you lived in any country other than your country of citizenship or your current country of residence (indicated above) for more than six months? (required)").get_by_text("No").click()
    page.get_by_role("group", name="Previous countries of residence: during the past five years, have you lived in any country other than your country of citizenship or your current country of residence (indicated above) for more than six months? (required)").locator("div").filter(has_text="Yes").click()
    page.get_by_role("group", name="Previous country of residence #1").get_by_role("combobox", name="Country (required)").select_option("12: 011")
    page.get_by_role("combobox", name="Immigration status (required)").select_option("4: 04")
    page.get_by_label("Start date of imigration status (YYYY/MM/DD) (required)").click()
    page.get_by_label("Start date of imigration status (YYYY/MM/DD) (required)").fill("2022/01/01")
    page.get_by_label("Start date of imigration status (YYYY/MM/DD) (required)").press("Tab")
    page.get_by_label("End date of immigration status (YYYY/MM/DD) (required)").fill("2025/01/01")
    page.get_by_label("End date of immigration status (YYYY/MM/DD) (required)").click()
    page.get_by_label("End date of immigration status (YYYY/MM/DD) (required)").press("ArrowLeft")
    page.get_by_label("End date of immigration status (YYYY/MM/DD) (required)").press("ArrowLeft")
    page.get_by_label("End date of immigration status (YYYY/MM/DD) (required)").press("ArrowLeft")
    page.get_by_label("End date of immigration status (YYYY/MM/DD) (required)").press("ArrowLeft")
    page.get_by_label("End date of immigration status (YYYY/MM/DD) (required)").press("ArrowLeft")
    page.get_by_label("End date of immigration status (YYYY/MM/DD) (required)").press("ArrowLeft")
    page.get_by_label("End date of immigration status (YYYY/MM/DD) (required)").fill("2023/01/01")
    page.get_by_role("button", name="Add another").click()
    page.get_by_role("group", name="Previous country of residence #2").get_by_role("combobox", name="Country (required)").select_option("3: 131")
    page.get_by_role("group", name="Previous country of residence #2").get_by_role("combobox", name="Immigration status (required)").select_option("4: 04")
    page.get_by_role("group", name="Previous country of residence #2").get_by_label("Start date of imigration status (YYYY/MM/DD) (required)").click()
    page.get_by_role("group", name="Previous country of residence #2").get_by_label("Start date of imigration status (YYYY/MM/DD) (required)").fill("2023-01-01")
    page.get_by_role("group", name="Previous country of residence #2").get_by_label("Start date of imigration status (YYYY/MM/DD) (required)").press("ArrowLeft")
    page.get_by_role("group", name="Previous country of residence #2").get_by_label("Start date of imigration status (YYYY/MM/DD) (required)").press("ArrowLeft")
    page.get_by_role("group", name="Previous country of residence #2").get_by_label("Start date of imigration status (YYYY/MM/DD) (required)").fill("2023-01/01")
    page.get_by_role("group", name="Previous country of residence #2").get_by_label("Start date of imigration status (YYYY/MM/DD) (required)").press("ArrowLeft")
    page.get_by_role("group", name="Previous country of residence #2").get_by_label("Start date of imigration status (YYYY/MM/DD) (required)").press("ArrowLeft")
    page.get_by_role("group", name="Previous country of residence #2").get_by_label("Start date of imigration status (YYYY/MM/DD) (required)").press("ArrowLeft")
    page.get_by_role("group", name="Previous country of residence #2").get_by_label("Start date of imigration status (YYYY/MM/DD) (required)").fill("2023/01/01")
    page.get_by_role("group", name="Previous country of residence #2").get_by_label("Start date of imigration status (YYYY/MM/DD) (required)").press("Tab")
    page.get_by_role("group", name="Previous country of residence #2").get_by_label("End date of immigration status (YYYY/MM/DD) (required)").fill("2023/01/09")
    page.get_by_role("group", name="If you answered 'yes' to the previous question, please provide details.").click()
    page.get_by_role("combobox", name="Current marital status (required)").select_option("4: 01")
    page.get_by_role("combobox", name="Current marital status (required)").select_option("6: 02")
    page.get_by_role("group", name="Have you previously been married or in a common-law relationship? (required)").get_by_text("No").click()
    page.get_by_role("button", name="Save and continue").click()
    page.get_by_label("Apt./Unit").click()
    page.get_by_label("P.O. Box").click()
    page.get_by_label("P.O. Box").fill("111")
    page.get_by_label("P.O. Box").press("Tab")
    page.get_by_label("Apt./Unit").fill("1111")
    page.get_by_label("Apt./Unit").press("Tab")
    page.get_by_label("Street no.").fill("8889")
    page.get_by_label("Street no.").press("Tab")
    page.get_by_label("Street Name").fill("Lay rd")
    page.get_by_label("Street Name").press("Tab")
    page.get_by_label("City/Town (required)").fill("Richmond")
    page.get_by_label("City/Town (required)").press("Tab")
    page.get_by_role("combobox", name="Country (required)").select_option("41: 155")
    page.get_by_role("combobox", name="Country (required)").select_option("42: 511")
    page.get_by_role("combobox", name="Province/State (required)").select_option("30: 11")
    page.get_by_label("Postal Code (required)").click()
    page.get_by_label("Postal Code (required)").press("CapsLock")
    page.get_by_label("Postal Code (required)").fill("V3E 0M9")
    page.get_by_label("Postal Code (required)").press("Tab")
    page.get_by_role("group", name="Residential address same as mailing address? (required)").get_by_text("No").click()
    page.get_by_role("group", name="Residential address same as mailing address? (required)").get_by_text("Yes").click()
    page.get_by_role("group", name="Primary Telephone Number (required)").get_by_text("Canada/US").click()
    page.get_by_role("group", name="Primary Telephone Number (required)").locator("div").filter(has_text="Other").click()
    page.get_by_role("group", name="Primary Telephone Number (required)").get_by_text("Canada/US").click()
    page.get_by_role("combobox", name="Type (required)").select_option("3: 03")
    page.get_by_label("No. (required)").fill("778-909-8767")
    page.get_by_role("group", name="Do you want us to contact you using the email address used for this account? (required)").get_by_text("No").click()
    page.get_by_role("group", name="Do you want us to contact you using the email address used for this account? (required)").get_by_text("Yes").click()
    page.get_by_role("main").click()
    page.get_by_label("P.O. Box").click()
    page.get_by_label("P.O. Box").fill("")
    page.get_by_role("button", name="Save and continue").click()
    page.get_by_text("No", exact=True).click()
    page.get_by_text("Yes").click()
    page.get_by_label("Passport/Travel document number (required)").click()
    page.get_by_label("Passport/Travel document number (required)").fill("2342343423")
    page.get_by_role("combobox", name="Country of issue (required)").select_option("11: 011")
    page.get_by_label("Issue date (YYYY/MM/DD) (required)").click()
    page.get_by_label("Issue date (YYYY/MM/DD) (required)").fill("2020/01/01")
    page.get_by_label("Expiry date (YYYY/MM/DD) (required)").click()
    page.get_by_label("Expiry date (YYYY/MM/DD) (required)").fill("2024/09/09")
    page.get_by_role("button", name="Save and continue").click()
    
    # National ID
    page.locator("div").filter(has_text="No").click()
    page.get_by_text("Yes").click()
    page.get_by_label("National identity document number (required)").fill("23423423")
    page.get_by_role("combobox", name="Country of Issue (required)").select_option("2: 151")
    page.get_by_label("Issue date (YYYY/MM/DD) (required)").fill("2020/01/01")
    page.get_by_label("Expiry date (YYYY/MM/DD) (required)").fill("2025/09/02")
    page.get_by_role("button", name="Save and continue").click()