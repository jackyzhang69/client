""" 
This is the master threed for all page forms filling.
fill_handler: the function to fill the specific pages in any website
arguments: the arguments for the fill_handler
"""

from playwright.sync_api import sync_playwright
from client.system.config import console
from dataclasses import dataclass
import os

@dataclass
class Filler:
    headless:bool=True
    slow_mo:int=0
    view_port_size={"width": 1000, "height": 1440}
    
    def fill(self,pages_builder,pages_builder_arguments:dict):
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=self.headless,slow_mo=self.slow_mo)
            context = browser.new_context()
            page = context.new_page()
            page.set_viewport_size(self.view_port_size)

            # Start tracing before creating / navigating a page.
            context.tracing.start(screenshots=True, snapshots=True, sources=True)

            """ Build pages according to page, page names, and data """
            webpages=pages_builder(page,**pages_builder_arguments)
            self.handle_pages(webpages,**pages_builder_arguments)

            # Stop tracing and export it into a zip archive.
            context.tracing.stop(path = "/Users/jacky/desktop/trace.zip")
            
            context.close()
            browser.close()
            
    def handle_pages(self,web_pages, skip_pages_range=None, *,pdf=False, png=False, folder=".",**args):
        """pages handling
        You can deterine skip pages if it is able to be skipped
        """
        for page_no, web_page in enumerate(web_pages):
            if (
                skip_pages_range == [] or skip_pages_range == None
                or page_no < skip_pages_range[0]
                or page_no > skip_pages_range[1]
            ):
                console.print(f"Hanlding page #{page_no}: {web_page.name}")
                web_page.make_actions()
            else:
                console.print(f"Skipping page #{page_no}: {web_page.name}")

            if pdf:
                web_page.save_pdf(os.path.join(folder, web_page.name))
            if png:
                web_page.save_img(os.path.join(folder, web_page.name))
            web_page.next()

        console.print("All pages are handled.", style="green")
