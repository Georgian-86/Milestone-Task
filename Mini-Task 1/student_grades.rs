use std::io;

fn calculate_average(total_marks: f32, num_subjects: u32) -> f32 {
    total_marks / num_subjects as f32
}

fn assign_grade(average: f32) -> &'static str {
    if average >= 90.0 {
        "A"
    } else if average >= 75.0 {
        "B"
    } else if average >= 60.0 {
        "C"
    } else {
        "D"
    }
}

fn main() {
    let mut name = String::new();
    println!("Enter student's name:");
    io::stdin().read_line(&mut name).expect("Failed to read name");
    let name = name.trim();

    let mut total_marks_str = String::new();
    println!("Enter total marks:");
    io::stdin().read_line(&mut total_marks_str).expect("Failed to read total marks");
    let total_marks: f32 = total_marks_str.trim().parse().expect("Please enter a valid number");

    let mut num_subjects_str = String::new();
    println!("Enter number of subjects:");
    io::stdin().read_line(&mut num_subjects_str).expect("Failed to read number of subjects");
    let num_subjects: u32 = num_subjects_str.trim().parse().expect("Please enter a valid number");

    let average = calculate_average(total_marks, num_subjects);
    let grade = assign_grade(average);

    println!("\nStudent: {}", name);
    println!("Total Marks: {}", total_marks);
    println!("Number of Subjects: {}", num_subjects);
    println!("Average: {:.2}", average);
    println!("Grade: {}", grade);
} 