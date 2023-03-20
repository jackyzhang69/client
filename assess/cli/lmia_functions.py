from client.system.config import console
from assess.lmia.lmia import LMIA
from assess.model.assess import Project

def get_info(the_model):
    info_markdown = getattr(the_model, "info")()
    console.print(info_markdown)


def solution(args,project:Project):
    if type(args)==str and args in ["-i","--info"] or args.info:
        get_info(LMIA)
        return
    solution=LMIA(stage_name="lmia",**args.__dict__).solution
    solution.show(markdown=args.markdown)

    """ save the solution to the project """
    project.previous_solution=solution
    if args.save:
        if solution not in project.solutions:
            project.solutions.append(solution)
            console.print(f"Solution is saved to the project.",style="green")
        else:
            console.print(f"Solution is already in the project. Ignored.",style="yellow")
    
