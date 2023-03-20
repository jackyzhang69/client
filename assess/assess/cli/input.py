#!/usr/bin/env python
"""
Example of using the control-space key binding for auto completion.
"""
from prompt_toolkit.shortcuts import CompleteStyle, prompt
from prompt_toolkit.completion import WordCompleter
from prompt_toolkit.key_binding import KeyBindings
from prompt_toolkit.auto_suggest import AutoSuggestFromHistory
from prompt_toolkit.history import InMemoryHistory
from datetime import datetime

kb = KeyBindings()

animal_completer = WordCompleter(
    [
        "bcss",
        "skes",
        "ees",
        "oinp_fws",
        "oinp_ds",
        "oinp_igs",
        "oinp_mgs",
        "oinp_pgs",
        "solution",
        "doc",
        "time",
        "fee",
        "app_req",
        "emp_req",
        "docs",
        "times",
        "fees",
        "app_reqs",
        "emp_reqs",
        "client",
        "path",
        "report",
        "save",
        "load",
        "show",
        "find",
        "wages",
        "info",
        "qnocs",
        "qareas",
        "sp",
        "er",
        "duties",
        "special_nocs",
    ],
    ignore_case=True,
)

# Create some history first. (Easy for testing.)
history = InMemoryHistory()

# Database of words to be replaced by typing.
corrections = {
    "onip": "oinp",
    "oinp-fws": "oinp_fws",
    "oinp-ds": "oinp_ds",
    "oinp-igs": "oinp_igs",
    "oinp-mgs": "oinp_mgs",
    "oinp-pgs": "oinp_pgs",
}

# We add a custom key binding to space.
@kb.add(" ")
def _(event):
    """
    When space is pressed, we check the word before the cursor, and
    autocorrect that.
    """
    b = event.app.current_buffer
    w = b.document.get_word_before_cursor()

    if w is not None:
        if w in corrections:
            b.delete_before_cursor(count=len(w))
            b.insert_text(corrections[w])

    b.insert_text(" ")


@kb.add("c-space")
def _(event):
    """
    Start auto completion. If the menu is showing already, select the next
    completion.
    """
    b = event.app.current_buffer
    if b.complete_state:
        b.complete_next()
    else:
        b.start_completion(select_first=False)


def get_prompt():
    "Tokens to be shown before the prompt."
    now = datetime.now()
    return [
        ("bg:#008800 #ffffff", f"{now.hour}:{now.minute}:{now.second}"),
        ("bg:#008800 fg:#ffffff", " Assess $: "),
    ]
