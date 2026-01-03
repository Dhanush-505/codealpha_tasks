// Question class moved to `Question.java`

import java.util.Scanner;

public class Quiz {
    private final Question[] questions;
    private int score;

    public Quiz(Question[] questions) {
        this.questions = questions;
        this.score = 0;
    }

    public void takeQuiz(int[] userAnswers) {
        for (int i = 0; i < questions.length; i++) {
            if (questions[i].isCorrect(userAnswers[i])) {
                score++;
            }
        }
    }

    public int getScore() {
        return score;
    }

    public static void main(String[] args) {
        Question q1 = new Question("What is the capital of France?", new String[]{"1. Berlin", "2. Madrid", "3. Paris", "4. Rome"}, 3);
        Question q2 = new Question("What is 2 + 2?", new String[]{"1. 3", "2. 4", "3. 5", "4. 6"}, 2);
        Question q3 = new Question("What is the largest planet in our solar system?", new String[]{"1. Earth", "2. Jupiter", "3. Saturn", "4. Mars"}, 2);

        Question[] questions = {q1, q2, q3};
        Quiz quiz = new Quiz(questions);

        Scanner scanner = new Scanner(System.in);
        int[] userAnswers = new int[questions.length];

        for (int i = 0; i < questions.length; i++) {
            System.out.println((i + 1) + ". " + questions[i].getQuestion());
            String[] opts = questions[i].getOptions();
            for (String opt : opts) {
                System.out.println(opt);
            }

            while (true) {
                System.out.print("Your answer (enter option number): ");
                String line = scanner.nextLine().trim();
                try {
                    int ans = Integer.parseInt(line);
                    if (ans >= 1 && ans <= opts.length) {
                        userAnswers[i] = ans;
                        break;
                    } else {
                        System.out.println("Please enter a number between 1 and " + opts.length + ".");
                    }
                } catch (NumberFormatException e) {
                    System.out.println("Invalid input. Enter the option number (e.g., 1, 2, 3, ...).");
                }
            }
            System.out.println();
        }

        quiz.takeQuiz(userAnswers);
        System.out.println("Your score: " + quiz.getScore() + "/" + questions.length);
        scanner.close();
    }
}