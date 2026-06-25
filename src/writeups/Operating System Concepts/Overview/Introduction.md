## What is an Operating System (OS)?

An **Operating System** is a program that acts as an intermediary between the application and the hardware

Operating Systems are varied depending on the purpose of there use:
- In mainframe these are mostly to utilize the hardware
- On PCs (Personal Computers), these support complex games, and many more applications
- On handhelds, these are optimized to make the interface intractable

The Operating System (OS) provides the means for using Computer Components, such as the hardware, software and data. We can have to Point of View (POV), the user and the system

### User View:
- Mostly varies by OS and the interface being used
- For a single person OS, it is more focused on making it easy to use
- Some sit in-front of a terminal connected to a mainframe or minicomputer, these doesn't have an user friendly interface due to it's optimization to perform better at transferring resources
Like these there are many types of user views in Operating Systems

### System View:
- An OS is the most closest to the hardware
- We can view an OS as a resource allocator
- An OS has many things to handle: hardware (CPU time, memory space, file-storage space and so on), software (Every single application that the user runs). The OS should decide how to allocate the resources to a program or user by calculating how much resources is needed.
- It also has to handle the Input and programs run by the user
- In general, however, we have no completely adequate definition of an Operating System
- The fundamental goal of an OS is to execute user programs and make the users work easier
- There is way more things on the OS view, but all these combined single piece of software is what we call an Operating System
- Each Operating System have their own requirements on hardware
- The storage is calculated in Gigabytes (GB). 1 GB has 1024 MB and I assume this is known by the user
- The OS is the one program that keeps running at all the time (That part is usually called the **kernel**)

### System Goals:
- Defining the exact goal can be tricky
- The primary goal of **some** Operating System can be convenience for the user
- These exist because it is much easier to compute with them then without them
- Overall primary goal can be said as efficient operation, but still this is mostly for large, shared and multi-user systems
- UNIX started with keyboard and a printer as its interface, over time it evolved and now it has a Graphical User Interfaces (GUIs)
- The design of an OS is the complex task, they can be trade-offs, in the design and implementation, but still people are trying to bring an OS to perform better and are constantly updating it
- The Operating Systems and Computer architecture are constantly being adjusted to make them work better with one another
- Then users have proposed to change the hardware design to simplify them
- Note: OS problems led to creation of new hardware

## Mainframe Systems

These are the first computers used to tackle many commercial(Like Banking) and scientific application(Like Weather Forecasting)
We are gonna look into simple **batch systems**, where the computers runs one and only one application, to **time-shared systems**, which allows user interactions

### Batch Systems
- Early computers were enormous machines run from a console, common inputs were line printers, tape drives and punched cards, the user took a bunch of **punched cards** and grouped it as a program, (the program, data and control information was called as a **job**), the output took long time to compute (minutes, hours, or even days), the output consisted of the result as well as some dump of memory and register contents for debugging
- The operators **batched** together jobs with similar needs and ran them as a group, hence the programmers leave their program to the operator to batch them together and run it, the output was sent to the appropriate programmer
- The CPUs were electrical so they were able to read and execute the mechanical inputs quickly, the difference is speed was very large, as the CPU can complete it's calculation in nanoseconds with thousands of instructions per seconds and the fast card readers took around 1200 cards per minute (This is also called as **bottle neck**)
- With the invention of disk technology this was controlled as multiple jobs were stored in a disk and were ready to be used, with direct access to the disks the operating systems were able to perform **job scheduling**, to use resources to perform tasks efficiently

### Multiprogrammed Systems
- The most important aspect of job scheduling is the ability to multiprogram
- A single user in general can't keep either the CPU or the I/O devices busy at all the times (this mean a single use can't hog all the traffic and other users should be able to use the system resources), multiprogramming organizes the jobs such that there is room for other users
- The idea is: The OS keeps several jobs in the memory simultaneously, since the number of jobs that can be stored is much smaller than the job pool, the OS picks and begins to one of the many jobs in the memory, when a job requires interaction, the **job waits**, when the job waits it switches to another job and when this job waits it switches to another and so on
- Each job has a wait time-out set, so when it reaches the wait time it eventually terminates the job, freeing the memory and processing power
- As long as there is a job, the CPU won't stay idle
- Multiprogramming is the first instance in which the system decides for the user, that's why it is highly sophisticated
- When there are a lot of jobs in the memory and more incoming and the memory has not enough room, then making that decision is called **job scheduling**

### Time-Sharing Systems
- Time-Sharing also know as **Multitasking**, this was invented to overcome the limitation of multiprogramming which did not provide the user interaction with computer system
- Time-Sharing is a logical extension of multiprogramming, the CPU executes all the jobs switching among each one very frequently, enabling the user to interact with the running program
- An interactive (or hands-on) computer system provides direct communication between the user and the system, the user is able to give instruction directly using a keyboard or mouse, and the responds is typically within a second or so
- Time-Sharing also enables multiple users to use one system by making the CPU switch the users rapidly from one user to another, giving the impression that the user is using a dedicated system of their own, even though it is being shared among multiple users
- A program loaded into the memory and is being executed is commonly known as a **process**, the process typically finishes in a short amount of time unless an I/O is to be required
- When an input is required, the process has to wait till the user enters an input, for example: 7 characters per second is faster for humans, but for computers that's incredibly slow, when the interactive input takes play the CPU rapidly switches to some other program of some other user
- In both, Time-Sharing OS and Multiprogrammed OS it is difficult to manage memory and protect it, to obtain a reasonable response time, jobs gets swapped in and out of the main memory to the disk which serves as a backing store for the main memory
- **Virtual memory** is a technique that allows the execution of a job that may not be in memory, the main advantage is that the program can be larger than the physical memory