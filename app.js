const fs = require("fs");

// Read students.json
const data = fs.readFileSync("students.json", "utf8");
const students = JSON.parse(data);


// 1. Get the average grade of a student
function getAverageGrade(student) {
    if (!student || !Array.isArray(student.grades) || student.grades.length === 0) {
        return 0;
    }

    const total = student.grades.reduce((sum, grade) => sum + grade, 0);

    return total / student.grades.length;
}


// 2. Get the top students
function getTopStudents(students, n) {
    if (!Array.isArray(students)) {
        throw new Error("Students must be an array.");
    }

    if (!Number.isInteger(n) || n < 0) {
        throw new Error("The number of students must be a non-negative integer.");
    }

    return students
        .map(student => ({
            ...student,
            averageGrade: getAverageGrade(student)
        }))
        .sort((a, b) => b.averageGrade - a.averageGrade)
        .slice(0, n);
}


// 3. Group students by course
function groupByCourse(students) {
    if (!Array.isArray(students)) {
        throw new Error("Students must be an array.");
    }

    return students.reduce((groups, student) => {
        const course = student.course || "Unknown";

        if (!groups[course]) {
            groups[course] = [];
        }

        groups[course].push({ ...student });

        return groups;
    }, {});
}


// 4. Get enrolled student count
function getEnrolledCount(students) {
    if (!Array.isArray(students)) {
        throw new Error("Students must be an array.");
    }

    return students.reduce(
        (count, student) => {
            if (student.enrolled === true) {
                count.enrolled++;
            } else {
                count.notEnrolled++;
            }

            return count;
        },
        {
            enrolled: 0,
            notEnrolled: 0
        }
    );
}


// 5. Find a student by name
function findStudent(students, name) {
    if (!Array.isArray(students)) {
        throw new Error("Students must be an array.");
    }

    if (typeof name !== "string") {
        throw new Error("Student name must be a string.");
    }

    const searchName = name.trim().toLowerCase();

    return (
        students.find(
            student =>
                typeof student.name === "string" &&
                student.name.toLowerCase() === searchName
        ) || null
    );
}


// 6. Get average grade for each course
function getCourseAverages(students) {
    if (!Array.isArray(students)) {
        throw new Error("Students must be an array.");
    }

    const courseData = students.reduce((courses, student) => {
        const course = student.course || "Unknown";

        if (!courses[course]) {
            courses[course] = {
                totalGrades: 0,
                gradeCount: 0
            };
        }

        if (Array.isArray(student.grades)) {
            student.grades.forEach(grade => {
                if (typeof grade === "number" && !isNaN(grade)) {
                    courses[course].totalGrades += grade;
                    courses[course].gradeCount++;
                }
            });
        }

        return courses;
    }, {});

    return Object.entries(courseData)
        .map(([course, data]) => ({
            course: course,
            averageGrade:
                data.gradeCount === 0
                    ? 0
                    : data.totalGrades / data.gradeCount
        }))
        .sort((a, b) => b.averageGrade - a.averageGrade);
}


// 7. Export summary
function exportSummary(students) {
    if (!Array.isArray(students)) {
        throw new Error("Students must be an array.");
    }

    const allGrades = students.reduce((grades, student) => {
        if (Array.isArray(student.grades)) {
            return grades.concat(
                student.grades.filter(
                    grade => typeof grade === "number" && !isNaN(grade)
                )
            );
        }

        return grades;
    }, []);

    const overallAverage =
        allGrades.length === 0
            ? 0
            : allGrades.reduce((sum, grade) => sum + grade, 0) /
              allGrades.length;

    const topStudents = getTopStudents(students, 1);

    return {
        totalStudents: students.length,

        overallAverageGrade: Number(
            overallAverage.toFixed(2)
        ),

        topPerformingStudent:
            topStudents.length > 0
                ? {
                      name: topStudents[0].name,
                      averageGrade: Number(
                          topStudents[0].averageGrade.toFixed(2)
                      )
                  }
                : null,

        breakdownByCourse: getCourseAverages(students)
    };
}


// MAIN FUNCTION
function main() {
    console.log("==========================================");
    console.log("       STUDENT RECORDS DATA REPORT");
    console.log("==========================================");

    // Summary
    const summary = exportSummary(students);

    console.log("\nTOTAL STUDENTS");
    console.log("------------------------------------------");
    console.log(summary.totalStudents);

    console.log("\nOVERALL AVERAGE GRADE");
    console.log("------------------------------------------");
    console.log(summary.overallAverageGrade.toFixed(2));


    // Enrollment
    const enrollment = getEnrolledCount(students);

    console.log("\nENROLLMENT STATUS");
    console.log("------------------------------------------");
    console.log(`Enrolled: ${enrollment.enrolled}`);
    console.log(`Not Enrolled: ${enrollment.notEnrolled}`);


    // Top students
    console.log("\nTOP 3 STUDENTS");
    console.log("------------------------------------------");

    const topStudents = getTopStudents(students, 3);

    if (topStudents.length === 0) {
        console.log("No students available.");
    } else {
        topStudents.forEach((student, index) => {
            console.log(
                `${index + 1}. ${student.name} - ${student.averageGrade.toFixed(2)}`
            );
        });
    }


    // Course averages
    console.log("\nAVERAGE GRADE BY COURSE");
    console.log("------------------------------------------");

    const courseAverages = getCourseAverages(students);

    if (courseAverages.length === 0) {
        console.log("No course data available.");
    } else {
        courseAverages.forEach(course => {
            console.log(
                `${course.course}: ${course.averageGrade.toFixed(2)}`
            );
        });
    }


    // Search for a student
    console.log("\nSTUDENT SEARCH");
    console.log("------------------------------------------");

    const searchResult = findStudent(
        students,
        "Juan Dela Cruz"
    );

    if (searchResult) {
        console.log(`Student found: ${searchResult.name}`);
    } else {
        console.log("Student not found.");
    }


    // Create report.json
    fs.writeFileSync(
        "report.json",
        JSON.stringify(summary, null, 4)
    );

    console.log("\n==========================================");
    console.log("Report exported successfully to report.json");
    console.log("==========================================");
}


// Run the main function
main();
