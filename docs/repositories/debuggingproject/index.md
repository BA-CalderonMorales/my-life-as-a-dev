# repo_DebuggingProject

DISCLAIMER: THIS IS NOT CODE THAT I WROTE FROM SCRATCH. I RECIEVED THIS CODE AS A PROJECT TO ATTEMPT TO CREATE A SCENARIO WHERE IF I WAS WORKING WITH A TEAM, AND THERE WERE A TIME THAT I NEEDED TO DOWNLOAD THE CODE, I WOULD KNOW HOW TO DO THIS. AGAIN, THIS IS A WORK PRODUCT THAT I DID NOT INITIALLY MAKE, ALL CREDIT FOR THE END PRODUCT OF THE CLEANED UP CODE WILL BE FOR DEV CODE CAMP. 

Now that that's out of the way, here is what I'm learning from my first commit to this new repo about a debug project. One, there can always be errors, but there can also be errors that you can not see right off the bat. Those errors that are invisible to most are called "bugs". Two, in order to work with a team, no matter where I go, if I did not initially create the code, I would need to know the steps necessary to create a virtual machine, add that virtual machine to my project, and then be able to debug the code with all those previous steps in place. This will serve as a reference for myself and anyone else who wants to use this to be able to do what I just mentioned.

So, here are the steps:

1) Download the zip file from the GitHub repository owner, or from whoever has the starter code that you need to work on.
2) Place that repository in a place where you have all your projects. This location will vary from time to time (person to person), so it's best that you just make sure you remember where you placed the extracted zip file.
3) Next, go ahead and do one of two things:<br>
  i) Right click on the folder that your project is in and then open it via "Open Folder with PyCharm"<br>
  ii) Or, if the previous option is not available to you, then just open the folder up in the PyCharm IDE (as you should know how to do)<br>
4) After opening the project up, you'll need to go ahead and go follow these next few steps to get to the window I'm about to talk about:<br>
  i) Click: File -> Settings -> (Dropdown) Project: "YourProject" -> Python Interpreter -> (Gear Icon) Top Right, under "x"<br>
5) Once you made it to this (Gear Icon) window, you'll need to click: Add -> (Folder Icon) Location.
6) Step 5) should have brought you to the "Select Location for Virtual Enviornment" window. Once here, you'll need to click on the "downloaded_project_folder" that you extracted, and then, after the last letter in the name that pops up in the "Location:" input box, you'll need to add \venv to it.<br> 
  i) NOTE: This may not be a necessary step. Python may have already had the folder you were looking for pulled up, and there may already be a \venv at the end of the file path. If you are confused, do not try to go further unless you feel confident you have the same "downloaded_project_folder" location.<br>
  ii) The "Location:" input box should have a file path that looks something like this: "C:\...\downloaded_project_folder\venv"<br>
7) Upon locating the correct folder and making sure that it has \venv at the end of the file path, you can go ahead and press on "Ok". <br><br>
8) Here is an example of what a file path should look like after you completed the steps above: <br><br> ![image](https://user-images.githubusercontent.com/62074841/122612832-6cb62b00-d049-11eb-83f1-fa24f6fc3c9b.png) <br><br>
9) So, we've got the previous steps taken care of, now you need to add the proper configuration to the current main.py that you are going to work on. Before this though, make sure that you have the project's main.py file open and ready to configure. 
10) To get to where you need to be now, you'll need to follow the next couple of click-steps:<br>
  i) Click:  The dropdown (Left of the "Run icon *triangle*") -> Edit Configurations<br>
11) You should be in the "Run/Debug Configurations" window. Here you'll need to cofigure two settings: A) Script path, and B) Python interpreter:<br>
  i) Script path: <br>
    a) Go ahead and click on the folder icon, then search up where your main.py is located within the current \downloaded_project_folder.<br>
    b) Make sure it is the main.py that is located inside of the project folder that you will be running your code to debug.<br>
  ii) Python interpreter:<br>
    a) Click on the dropdown, and the only change here is to make sure that the current interpreter is not highlighted in red. If you did Steps 1) - 8) right, then there should be another interpreter setting with the \downloaded_project_folder\venv\Scripts\python.exe ending. Again, this is only if the current interpreter settings is literally the color red.<br>
12) After you followed step 11) exactly, you'll be able to apply the settings, and, finally, run your code. 

<b>And that's it!</b>
  
EXTRA: For debugging in PyCharm IDE, there is a command line tool called pdb. To use it, you'll need to use the following bit of code `pbd.set_trace()` whenever you want to step through a method, instead of using the built-in stepper that PyCharm has. It's just a tool, so feel free to use it (or not). Totally up to you! Happy coding!


_It's been a while since this repo was updated._
