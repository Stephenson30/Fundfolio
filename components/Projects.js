import Link from "next/link";
import React, { useState } from "react";
import { MockData } from "./MockData";
import styles from "@/components/styles/project.module.css";

export default function Projects() {
  // State for search inputs
  const [searchResult, setSearchResult] = useState("");
  const [filteredProjects, setFilteredProjects] = useState(MockData);

  // Filter logic
  const handleSearch = () => {
    console.log("MockData:", MockData);
    console.log("searchResult:", searchResult);

    const filtered = MockData.filter((project) => {
      const matchesName = project.projectName.includes(
        searchResult.toLowerCase()
      );
      const matchesCategory = project.category.includes(
        searchResult.toLowerCase()
      );
      const matchesLanguage = project.programming_language.includes(
        searchResult.toLowerCase()
      );

      console.log("matchesCategory:", matchesCategory);
      console.log("matchesLanguage:", matchesLanguage);
      console.log("matchesName:", matchesName);

      return matchesCategory || matchesLanguage || matchesName;
    });

    console.log("filtered:", filtered);
    setFilteredProjects(filtered);
  };
  return (
    <div className={styles.project}>
      <div className={styles.input_section}>
        <input
          type="text"
          placeholder="Search by Name, Category (e.g., web3), and Programming Language (e.g., javascript)"
          value={searchResult}
          onChange={(e) => setSearchResult(e.target.value)}
        />
        {filteredProjects.length !== 0 ? (
          <button onClick={handleSearch} >
            Search
          </button>
        ) : (
          <button onClick={handleSearch} >
            X
          </button>
        )}
      </div>

      {/* Display Filtered Projects */}
      <div className={styles.project_container}>
        {filteredProjects.length !== 0 ? (
          filteredProjects.map((project, index) => (
            <Link href={`/project/${project.id}`} key={index} className={styles.project_card}>
              <img
                src={project.image}
                alt={`${project.projectName} logo`}
                className={styles.project_image}
              />
              <div>
                <h3 className={styles.project_title}>{project.projectName}</h3>
                <p className={styles.project_description}>
                  {project.description}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <div>
            <p>Project type not found</p>
          </div>
        )}
      </div>
    </div>
  );
}
