document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const TRAITS = [
    ["abstraction", "ABSTRACTION"],
    ["intuition", "INTUITION"],
    ["computation", "COMPUTATION"],
    ["generalism", "GENERALISM"],
    ["rigor", "RIGOR"],
    ["application", "APPLICATION"]
  ];

  const mathematicians = {
    fourier: {
      name: "JOSEPH FOURIER",
      type: "THE PATTERN SEEKER",
      vector: {
        abstraction: 6,
        intuition: 8,
        computation: 7,
        generalism: 5,
        rigor: 6,
        application: 9
      },
      summary:
        "You look at apparent chaos and assume it is secretly made of simpler pieces. You are drawn to hidden frequencies, decompositions, repeating structure, and the possibility that a complicated phenomenon becomes legible after the right change of representation.",
      party:
        "You notice the playlist has a weirdly periodic structure and cannot stop thinking about it.",
      menace:
        "Taking apart the toaster when it stops behaving. It can be decomposed.",
      habitat:
        "Analysis, differential equations, mathematical physics, signal processing, dynamical systems.",
      motto:
        "There is probably a basis in which this becomes obvious."
    },

    euler: {
      name: "LEONHARD EULER",
      type: "THE PROLIFIC GENERALIST",
      vector: {
        abstraction: 7,
        intuition: 8,
        computation: 9,
        generalism: 10,
        rigor: 7,
        application: 8
      },
      summary:
        "You are constitutionally incapable of staying in one mathematical neighborhood. A problem is interesting because it connects to six other problems, three notations, a graph, an identity, and something nobody intended to study today.",
      party:
        "You join four conversations and somehow contribute something useful to all of them.",
      menace:
        "Accidentally creating notation everyone else has to use for the next three centuries.",
      habitat:
        "Analysis, number theory, graph theory, mechanics, geometry, combinatorics.",
      motto:
        "Wait, we literally just did this in another class."
    },

    noether: {
      name: "EMMY NOETHER",
      type: "THE STRUCTURE WHISPERER",
      vector: {
        abstraction: 10,
        intuition: 8,
        computation: 4,
        generalism: 8,
        rigor: 9,
        application: 6
      },
      summary:
        "Concrete examples are only the beginning for you. You want the structure that explains all of them at once: the symmetry, invariant, equivalence, or algebraic object that turns a pile of observations into one idea.",
      party:
        "You listen to twenty minutes of gossip and go: Wait, so there are really only three cases.",
      menace:
        "Generalizing a perfectly understandable problem until everyone realizes the generalization was the real problem.",
      habitat:
        "Abstract algebra, geometry, topology, symmetry, theoretical physics.",
      motto:
        "I feel like we're proving the same thing six different ways."
    },

    gauss: {
      name: "CARL FRIEDRICH GAUSS",
      type: "THE PERFECTIONIST",
      vector: {
        abstraction: 8,
        intuition: 8,
        computation: 9,
        generalism: 7,
        rigor: 10,
        application: 7
      },
      summary:
        "Correct is not enough. You want the argument to feel inevitable, compressed, and almost offensively elegant. You would rather sit with a result longer than release something that still has visible scaffolding.",
      party:
        "You take twelve photos, delete eleven, and post the perfect one.",
      menace:
        "Finding a two-line proof after someone has presented twenty slides.",
      habitat:
        "Number theory, geometry, analysis, probability, astronomy.",
      motto:
        "This works, but I hate it."
    },

    ramanujan: {
      name: "SRINIVASA RAMANUJAN",
      type: "THE CONJECTURER",
      vector: {
        abstraction: 7,
        intuition: 10,
        computation: 8,
        generalism: 6,
        rigor: 4,
        application: 3
      },
      summary:
        "You see the pattern before you know why it works. The relationship comes first; the explanation can catch up later.",
      party:
        "You make one startling observation, drop the mic, and turn out to be right.",
      menace:
        "Getting the right answer and having no idea how you're supposed to show your work.",
      habitat:
        "Number theory, infinite series, partitions, special functions.",
      motto:
        "Hear me out."
    },

    vonneumann: {
      name: "JOHN VON NEUMANN",
      type: "THE DANGEROUS POLYMATH",
      vector: {
        abstraction: 8,
        intuition: 8,
        computation: 10,
        generalism: 10,
        rigor: 8,
        application: 10
      },
      summary:
        "You look at the world and see systems waiting to be understood. A problem is never just theoretical or practical—you want to model it, compute it, and then see what happens when you start changing the parameters.",
      party:
        "Someone says, 'There should be an app for that,' and you stop listening because you're already building it.",
      menace:
        "Spending three hours automating something that takes five minutes.",
      habitat:
        "Computation, physics, game theory, economics, numerical analysis, complex systems.",
      motto:
        "There has to be a way to optimize this."
    },

    mirzakhani: {
      name: "MARYAM MIRZAKHANI",
      type: "THE GEOMETRIC EXPLORER",
      vector: {
        abstraction: 9,
        intuition: 9,
        computation: 5,
        generalism: 7,
        rigor: 9,
        application: 4
      },
      summary:
        "You rarely take the shortest route through a problem, and that's usually the point. You sketch, wander, double back, and keep exploring until you can see the shape of what's going on.",
      party:
        "You say, 'Wait, let me draw it,' and commandeer the nearest napkin.",
      menace:
        "Running out of paper before running out of problem.",
      habitat:
        "Geometry, topology, dynamical systems, moduli spaces.",
      motto:
        "Let's take the long way around."
    },

    erdos: {
      name: "PAUL ERDŐS",
      type: "THE COLLABORATIVE OBSESSIVE",
      vector: {
        abstraction: 7,
        intuition: 9,
        computation: 6,
        generalism: 9,
        rigor: 8,
        application: 3
      },
      summary:
        "You collect problems the way other people collect hobbies. The best part of mathematics is finding someone else who wants to obsess over the same one.",
      party:
        "You came for the free food and left with a collaborator.",
      menace:
        "Accidentally making homework out of a conversation.",
      habitat:
        "Combinatorics, graph theory, number theory, probability.",
      motto:
        "Congratulations, this is our problem now."
    }
  };

  const questions = [
    {
      text: "YOU HAVE BEEN STARING AT A PROBLEM FOR THREE HOURS. WHAT HAPPENS NEXT?",
      answers: [
        ["I rewrite it in a different representation. Surely it will confess.", { abstraction: 2, intuition: 1, computation: 1, application: 1 }],
        ["I start solving a different problem and somehow come back with three useful ideas.", { generalism: 3, intuition: 2 }],
        ["I ask what structure is actually being preserved.", { abstraction: 3, rigor: 1 }],
        ["I keep polishing the argument until every unnecessary step is gone.", { rigor: 3, abstraction: 1 }],
        ["I have a strong suspicion about the answer and start testing patterns.", { intuition: 3, computation: 1 }],
        ["I code a toy version and see what the system does.", { computation: 3, application: 2 }]
      ]
    },

    {
      text: "PICK YOUR ACADEMIC VICE.",
      answers: [
        ["Transforming things that absolutely did not ask to be transformed.", { abstraction: 2, application: 2, computation: 1 }],
        ["Starting six projects simultaneously.", { generalism: 3 }],
        ["Generalizing until nobody remembers the original problem.", { abstraction: 3 }],
        ["Spending forty minutes making one proof two lines shorter.", { rigor: 3 }],
        ["Trusting a pattern long before I can prove it.", { intuition: 3 }],
        ["Turning every interesting phenomenon into a model.", { application: 3, computation: 2 }]
      ]
    },

    {
      text: "SOMEONE SAYS, “THAT IS JUST A COINCIDENCE.” YOUR FIRST THOUGHT?",
      answers: [
        ["It is probably periodic.", { intuition: 2, application: 1 }],
        ["There is definitely an identity hiding here.", { generalism: 2, computation: 1 }],
        ["What symmetry could force it?", { abstraction: 3 }],
        ["Show me the calculation.", { rigor: 2, computation: 2 }],
        ["No, I have seen this pattern before.", { intuition: 3 }],
        ["Can we simulate it?", { computation: 3, application: 2 }]
      ]
    },

    {
      text: "WHAT MAKES A PROOF FEEL SATISFYING?",
      answers: [
        ["It decomposes a complicated thing into simple ingredients.", { abstraction: 2, intuition: 2 }],
        ["It unexpectedly connects two different areas.", { generalism: 3 }],
        ["It reveals the invariant that was controlling everything.", { abstraction: 3, rigor: 1 }],
        ["It is short, exact, and leaves nothing loose.", { rigor: 3 }],
        ["It confirms something I could already feel was true.", { intuition: 3 }],
        ["It tells me how to calculate or predict something real.", { application: 3, computation: 1 }]
      ]
    },

    {
      text: "YOUR NOTES DURING A DIFFICULT PROBLEM LOOK LIKE:",
      answers: [
        ["Layers, waves, arrows, and repeated decompositions.", { intuition: 2, application: 1 }],
        ["Five unrelated calculations that eventually become related.", { generalism: 3, computation: 1 }],
        ["Definitions, maps, equivalence classes, and increasingly abstract objects.", { abstraction: 3 }],
        ["A terrifyingly organized sequence of lemmas.", { rigor: 3 }],
        ["Dense formulas with several unexplained but promising patterns circled.", { intuition: 3, computation: 1 }],
        ["Tables, pseudocode, small experiments, and parameter sweeps.", { computation: 3, application: 2 }]
      ]
    },

    {
      text: "YOU GET TO CHOOSE ONE SUPERPOWER.",
      answers: [
        ["See the hidden frequencies inside any signal.", { intuition: 2, application: 2 }],
        ["Become instantly competent in any branch of mathematics.", { generalism: 3 }],
        ["See the abstract structure behind every example.", { abstraction: 3 }],
        ["Never make an algebra mistake again.", { rigor: 2, computation: 2 }],
        ["Know which conjectures are true before proving them.", { intuition: 3 }],
        ["Turn any messy real-world system into a solvable model.", { application: 3, computation: 2 }]
      ]
    },

    {
      text: "YOUR IDEAL RESEARCH CONVERSATION BEGINS WITH:",
      answers: [
        ["“What if we change coordinates?”", { abstraction: 2, intuition: 1 }],
        ["“This reminds me of something completely different.”", { generalism: 3 }],
        ["“What is the right object here?”", { abstraction: 3 }],
        ["“Can we state this more precisely?”", { rigor: 3 }],
        ["“I noticed something weird.”", { intuition: 3 }],
        ["“Can we build a model of it?”", { application: 3, computation: 1 }]
      ]
    },

    {
      text: "A NEW FIELD OF MATHEMATICS APPEARS TOMORROW. YOU:",
      answers: [
        ["Look for its natural transforms and decompositions.", { abstraction: 2, application: 1 }],
        ["Immediately learn enough to start stealing techniques from it.", { generalism: 3 }],
        ["Ask for the definitions and underlying category of objects.", { abstraction: 3, rigor: 1 }],
        ["Wait until the foundational results are stated cleanly.", { rigor: 3 }],
        ["Play with examples until patterns emerge.", { intuition: 3 }],
        ["Write code before the terminology has stabilized.", { computation: 3, application: 1 }]
      ]
    },

    {
      text: "WHAT KIND OF MATHEMATICAL BEAUTY GETS YOU MOST?",
      answers: [
        ["A messy signal resolving into a few clean components.", { intuition: 2, application: 2 }],
        ["A formula that unexpectedly works in five different places.", { generalism: 3 }],
        ["One structural theorem explaining an entire universe of examples.", { abstraction: 3 }],
        ["An argument so efficient it feels inevitable.", { rigor: 3 }],
        ["A numerical pattern that seems impossible until suddenly it is not.", { intuition: 3 }],
        ["A model whose predictions actually match the world.", { application: 3, computation: 2 }]
      ]
    },

    {
      text: "YOUR GROUP PROJECT ROLE IS:",
      answers: [
        ["The person who finds the representation that makes everything easier.", { intuition: 2, abstraction: 1 }],
        ["The person connecting everyone’s ideas together.", { generalism: 3 }],
        ["The person asking what assumptions are really necessary.", { abstraction: 2, rigor: 2 }],
        ["The person checking every detail before submission.", { rigor: 3 }],
        ["The person who says, “Wait—I think I see it.”", { intuition: 3 }],
        ["The person who builds the computational prototype.", { computation: 3, application: 2 }]
      ]
    },

    {
      text: "BE HONEST. WHICH ONE HAVE YOU SAID?",
      answers: [
        ["There has to be a simpler representation.", { abstraction: 2, intuition: 2 }],
        ["I wonder if this works in another field.", { generalism: 3 }],
        ["The example is not the point.", { abstraction: 3 }],
        ["Technically correct is not the same as finished.", { rigor: 3 }],
        ["I cannot prove it yet, but I am pretty sure.", { intuition: 3 }],
        ["Give me the data.", { computation: 2, application: 3 }]
      ]
    },

    {
      text: "LAST QUESTION. WHAT DO YOU WANT MATHEMATICS TO DO FOR YOU?",
      answers: [
        ["Reveal order inside complicated phenomena.", { intuition: 2, application: 2 }],
        ["Let me go everywhere.", { generalism: 3 }],
        ["Explain why things have to be the way they are.", { abstraction: 3, rigor: 1 }],
        ["Produce something exact and beautiful.", { rigor: 3 }],
        ["Let me discover patterns nobody else has noticed.", { intuition: 3 }],
        ["Give me a language for systems that matter outside mathematics.", { application: 3, computation: 2 }]
      ]
    }
  ];

  function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

const finalQuestion = questions.pop();

shuffleArray(questions);

questions.push(finalQuestion);

questions.forEach((question) => {
  shuffleArray(question.answers);
});

  const intro = document.getElementById("quiz-intro");
  const machine = document.getElementById("quiz-machine");
  const result = document.getElementById("quiz-result");

  const startButton = document.getElementById("quiz-start");
  if (!startButton) {
  console.error("Quiz start button not found: #quiz-start");
  return;
}
  const backButton = document.getElementById("quiz-back");
  const retakeButton = document.getElementById("quiz-retake");

  const questionText = document.getElementById("question-text");
  const answerWrap = document.getElementById("quiz-answers");

  const counter = document.getElementById("question-counter");
  const progress = document.querySelector(".quiz-progress");
  const progressBar = document.getElementById("quiz-progress-bar");

  let index = 0;
  let answers = [];

  function emptyVector() {
    return Object.fromEntries(
      TRAITS.map(([key]) => [key, 0])
    );
  }

  function renderQuestion() {
    const question = questions[index];

    counter.textContent =
      `QUESTION ${String(index + 1).padStart(2, "0")} / ${questions.length}`;

    progress.setAttribute("aria-valuenow", String(index + 1));

    progressBar.style.width =
      `${((index + 1) / questions.length) * 100}%`;

    questionText.textContent = question.text;

    answerWrap.innerHTML = "";

    question.answers.forEach(([label], answerIndex) => {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "quiz-answer";

      const marker = document.createElement("span");
      marker.className = "answer-marker";
      marker.textContent = String.fromCharCode(65 + answerIndex);

      const text = document.createElement("span");
      text.textContent = label;

      button.append(marker, text);

      if (answers[index] === answerIndex) {
        button.classList.add("is-selected");
      }

      button.addEventListener("click", () => {
        chooseAnswer(answerIndex);
      });

      answerWrap.appendChild(button);
    });

    backButton.hidden = index === 0;
  }

  function chooseAnswer(answerIndex) {
    answers[index] = answerIndex;

    if (index < questions.length - 1) {
      index += 1;
      renderQuestion();

      machine.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    } else {
      showResult();
    }
  }

  function calculateUserVector() {
    const total = emptyVector();

    answers.forEach((answerIndex, questionIndex) => {
      const weights =
        questions[questionIndex].answers[answerIndex][1];

      Object.entries(weights).forEach(([trait, value]) => {
        total[trait] += value;
      });
    });

    const max =
      Math.max(...Object.values(total), 1);

    return Object.fromEntries(
      Object.entries(total).map(([trait, value]) => [
        trait,
        Math.round((value / max) * 100) / 10
      ])
    );
  }

  function similarity(a, b) {
    const keys = TRAITS.map(([key]) => key);

    const dot = keys.reduce(
      (sum, key) => sum + a[key] * b[key],
      0
    );

    const magA = Math.sqrt(
      keys.reduce(
        (sum, key) => sum + a[key] ** 2,
        0
      )
    );

    const magB = Math.sqrt(
      keys.reduce(
        (sum, key) => sum + b[key] ** 2,
        0
      )
    );

    return dot / (magA * magB);
  }

  function classify(vector) {
    return Object.entries(mathematicians)
      .map(([key, person]) => ({
        key,
        person,
        similarity:
          similarity(vector, person.vector)
      }))
      .sort(
        (a, b) =>
          b.similarity - a.similarity
      )[0];
  }

  function showResult() {
    const vector = calculateUserVector();
    const match = classify(vector);
    const person = match.person;

    machine.hidden = true;
    result.hidden = false;

    document.getElementById("result-name").textContent =
      person.name;

    document.getElementById("result-type").textContent =
      `TYPE / ${person.type}`;

    document.getElementById("result-summary").textContent =
      person.summary;

    document.getElementById("result-party").textContent =
      person.party;

    document.getElementById("result-menace").textContent =
      person.menace;

    document.getElementById("result-habitat").textContent =
      person.habitat;

    document.getElementById("result-motto").textContent =
      person.motto;

    document.getElementById("result-score").textContent =
      `${Math.round(match.similarity * 100)}%`;

    const bars =
      document.getElementById("profile-bars");

    bars.innerHTML = "";

    TRAITS.forEach(([key, label]) => {
      const row =
        document.createElement("div");

      row.className = "profile-row";

      const labelEl =
        document.createElement("span");

      labelEl.className = "profile-label";
      labelEl.textContent = label;

      const track =
        document.createElement("span");

      track.className = "profile-track";

      const fill =
        document.createElement("span");

      fill.className = "profile-fill";
      fill.style.width =
        `${vector[key] * 10}%`;

      const value =
        document.createElement("span");

      value.className = "profile-value";
      value.textContent =
        vector[key].toFixed(1);

      track.appendChild(fill);
      row.append(labelEl, track, value);
      bars.appendChild(row);
    });

    result.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  function resetQuiz() {
    index = 0;
    answers = [];

    result.hidden = true;
    machine.hidden = false;

    renderQuestion();

    machine.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  startButton.addEventListener("click", () => {
    intro.hidden = true;
    machine.hidden = false;

    renderQuestion();

    machine.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });

  backButton.addEventListener("click", () => {
    if (index > 0) {
      index -= 1;
      renderQuestion();
    }
  });

  retakeButton.addEventListener(
    "click",
    resetQuiz
  );
});
