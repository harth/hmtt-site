// Default content. Shown until Firestore holds data, and used to seed it
// ("Publish default content" in the admin bar). After that, edit in the browser.

export const defaultServices = [
  {
    title: "Java & Spring Boot development",
    summary: "Microservices and REST APIs in modern Java, written to be readable, well tested and easy to support after handover.",
    tags: ["Java 21", "Spring Boot", "Hibernate"]
  },
  {
    title: "Integration & messaging",
    summary: "Connecting services and third-party systems through event-driven messaging and clearly defined APIs.",
    tags: ["Kafka", "RabbitMQ", "AWS SQS", "Apache Camel"]
  },
  {
    title: "Workflow & document automation",
    summary: "Replacing manual workarounds with case workflows, generated correspondence and automated email, SMS and letter notifications.",
    tags: ["jBPM", "Docmosis", "GOV.UK Notify"]
  },
  {
    title: "Delivery automation",
    summary: "CI/CD pipelines and containerised deployments that make releases routine rather than events.",
    tags: ["Jenkins", "GitLab CI", "Docker", "OpenShift", "AWS"]
  },
  {
    title: "Test automation",
    summary: "Unit, integration and end-to-end testing with a test-first approach, plus mutation testing where the business logic matters most.",
    tags: ["JUnit", "WireMock", "Playwright", "Cucumber"]
  },
  {
    title: "Technical leadership",
    summary: "Solution design, code review and mentoring for small agile teams, working directly with business and policy stakeholders.",
    tags: ["Design", "Code review", "Mentoring"]
  }
];

export const defaultJobs = [
  {
    client: "HM Courts & Tribunals Service",
    role: "Senior Java Engineer · Lead developer",
    start: "Oct 2025", end: "",
    sector: "Public sector", location: "Remote",
    summary: "Lead developer on a new confidentiality work stream for the SSCS appeals system, covering Child Support and Universal Credit appeals. Manual workarounds were replaced with an automated process for judges and caseworkers.",
    highlights: [
      "Produced the high-level design and built the REST API changes in the Spring Boot SSCS service",
      "Added Docmosis templates and GOV.UK Notify email, SMS and letter notifications to the service",
      "Led a team of three developers; introduced mutation testing alongside TDD"
    ],
    tech: ["Java", "Spring Boot", "Docmosis", "GOV.UK Notify"]
  },
  {
    client: "Registers of Scotland",
    role: "Senior Java Developer",
    start: "Mar 2024", end: "Oct 2025",
    sector: "Public sector", location: "Edinburgh",
    summary: "Spring Boot services and React front ends for land registration, with a focus on automation and reliability.",
    highlights: [
      "Automated title amendment processing to help reduce backlog volumes",
      "Built a Java/Playwright framework that removed repetitive manual keying for developers",
      "Wrote Groovy tooling for RabbitMQ message replay, backup and payload correction"
    ],
    tech: ["Spring Boot", "React", "TypeScript", "Cypress", "RabbitMQ", "OpenShift"]
  },
  {
    client: "Sky",
    role: "Technical Team Lead",
    start: "Sep 2021", end: "Mar 2024",
    sector: "Telecoms", location: "Livingston",
    summary: "Led a team building fulfilment services for Sky sales, centred on third-party integration.",
    highlights: [
      "Delivered FTTP integration with Openreach, enabling direct Sky installs",
      "Event-driven integration with Comcast systems using AWS SQS and Kafka",
      "Code review and coaching for junior developers"
    ],
    tech: ["Spring Boot", "Kafka", "AWS SQS", "GitLab"]
  },
  {
    client: "National Records of Scotland",
    role: "Senior Developer",
    start: "May 2020", end: "Sep 2021",
    sector: "Public sector", location: "Edinburgh",
    summary: "Spring Boot microservices and jBPM workflows for Scotland's Census 2022.",
    highlights: [
      "Built the gateway, config and security services for the microservice estate",
      "Developed jBPM workflows to process census returns and call external services",
      "Created a Selenium/Cucumber BDD suite and Jenkins pipelines"
    ],
    tech: ["Spring Boot", "jBPM", "Jenkins", "SonarQube", "Cucumber"]
  },
  {
    client: "Sky",
    role: "Technical Team Lead",
    start: "Aug 2014", end: "May 2020",
    sector: "Telecoms", location: "Livingston",
    summary: "Hands-on development across Sky's order management and fulfilment platforms.",
    highlights: [
      "Spring Boot services replacing legacy systems, handling around 5 million requests a day",
      "Built the core service behind Sky's loyalty programme",
      "Redesigned Jenkins pipelines and set up a Dockerised Selenium Grid"
    ],
    tech: ["Spring Boot", "Jenkins", "Docker", "Selenium"]
  },
  {
    client: "Capita (for Prudential)",
    role: "Application Architect",
    start: "2008", end: "Aug 2014",
    sector: "Financial services", location: "Stirling",
    summary: "Promoted from senior developer to application architect, delivering SOA solutions for Prudential.",
    highlights: [
      "Produced high-level and solution designs agreed with Prudential stakeholders",
      "Migrated extranet login to Java/WebLogic with SAML authentication",
      "Introduced CI pipelines and Oracle Service Bus"
    ],
    tech: ["Java", "WebLogic", "Oracle Service Bus", "SAML"]
  },
  {
    client: "Prudential",
    role: "Senior Analyst Programmer",
    start: "1999", end: "2008",
    sector: "Financial services", location: "Stirling",
    summary: "Joined as a graduate trainee writing COBOL, moving to Java after two years.",
    highlights: [
      "Delivered Prudential's corporate website and extranet on an Oracle back end"
    ],
    tech: ["Java", "Oracle", "COBOL"]
  }
];

export const SECTORS = ["Public sector", "Telecoms", "Financial services", "Other"];
