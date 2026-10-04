# Abschluss-Challenge: fehlerhafte Pipeline debuggen

[English version](final-challenge.md)

Die Abschluss-Challenge der Aufgabe ist eine fehlerhafte Python-Pipeline mit sechs Problemen,
teils funktional, teils sicherheitsrelevant. keysmith ist in TypeScript geschrieben, deshalb lief
die Challenge in einem eigenen Repository (siehe
[ADR-0007](adr/0007-final-challenge-in-separate-repo.md)):
[GitGitRice/pipeline-challenge](https://github.com/GitGitRice/pipeline-challenge).

- Fehlerhafte Version: Commit
  [`600af3c`](https://github.com/GitGitRice/pipeline-challenge/commit/600af3c), das YAML der
  Aufgabe unverändert.
- Reparierte Version: Commit
  [`31ef621`](https://github.com/GitGitRice/pipeline-challenge/commit/31ef621), Run
  [37224758323](https://github.com/GitGitRice/pipeline-challenge/actions/runs/37224758323)
  grün, Release
  [`v1.0.9`](https://github.com/GitGitRice/pipeline-challenge/releases/tag/v1.0.9) mit
  `app.zip`.

## Ergebnistabelle

| #   | Symptom / Risiko                                                                                                     | Ursache                                                                                                                      | Fix                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Verletzte Regel                                                                                   |
| --- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 1   | `setup-python` sucht Version `3.1`, der Run bricht ab                                                                | `python-version: 3.10` ohne Anführungszeichen. YAML liest eine Zahl und lässt die Null am Ende weg.                          | `python-version: "3.12"` ([`b31a8ee`](https://github.com/GitGitRice/pipeline-challenge/commit/b31a8ee))                                                                                                                                                                                                                                                                                                                                                  | Versionsnummern in YAML in Anführungszeichen setzen (Tag 2)                                       |
| 2   | `No module named pytest`, der Run bricht ab                                                                          | Der Test-Step steht vor dem Install-Step                                                                                     | Zuerst die Dependencies installieren, dann testen ([`c7b1c56`](https://github.com/GitGitRice/pipeline-challenge/commit/c7b1c56))                                                                                                                                                                                                                                                                                                                         | Steps laufen von oben nach unten: erst Dependencies, dann Tests (Tag 2)                           |
| 3   | `Could not open requirements file: 'requirement.txt'`, der Run bricht ab                                             | Tippfehler im Dateinamen (fehlendes `s`)                                                                                     | `requirements.txt` ([`c654eaf`](https://github.com/GitGitRice/pipeline-challenge/commit/c654eaf))                                                                                                                                                                                                                                                                                                                                                        | Pfade im Workflow müssen zum Repository passen (Tag 2)                                            |
| 4   | `build` findet `src/` nicht. Der Job läuft außerdem auch bei roten Tests, und ein Release wurde veröffentlicht       | `build` hat kein `actions/checkout` und kein `needs: test`. Alle Jobs starten parallel auf leeren Runnern.                   | Checkout und setup-python in `build`; Jobs mit `needs:` verketten: `test → build → deploy → release` ([`7d30715`](https://github.com/GitGitRice/pipeline-challenge/commit/7d30715))                                                                                                                                                                                                                                                                      | Jeder Job startet auf einem leeren Runner; kein Build und kein Release ohne grüne Tests (Tag 2–4) |
| 5   | Sicherheit: Das Deployment läuft auf jedem Branch und bei jedem Pull Request, ohne Freigabe, und gibt das Secret aus | `deploy` hat kein `if:` und kein `environment:`. `echo "Deploy nach ${{ secrets.DEPLOY_TOKEN }}"` schreibt den Wert ins Log. | `if: github.ref == 'refs/heads/main'` und `environment: production` (Required Reviewer, Branch-Regel `main`, `DEPLOY_TOKEN` als Environment-Secret) für `deploy` und `release`. Das Secret kommt über `env:` in den Step und wird nie ausgegeben; ein leerer Wert bricht mit `::error::` ab ([`b787ae7`](https://github.com/GitGitRice/pipeline-challenge/commit/b787ae7), [`c7d310d`](https://github.com/GitGitRice/pipeline-challenge/commit/c7d310d)) | Secrets nutzen, ohne sie auszugeben; Deployment mit einem Environment schützen (Tag 4)            |
| 6   | Qualität: Der Pip-Cache wird nie erneuert, Installationen nutzen dauerhaft alte Pakete                               | Statischer Key `pip-cache` ohne `hashFiles()`. Der Cache-Step stand außerdem in `release`, wo pip nie läuft.                 | Cache in den Job `test` verschieben; Key `${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}` ([`99e5ac2`](https://github.com/GitGitRice/pipeline-challenge/commit/99e5ac2), [`b31a8ee`](https://github.com/GitGitRice/pipeline-challenge/commit/b31a8ee))                                                                                                                                                                                     | Der Cache-Key muss sich mit den Dependencies ändern (Tag 3)                                       |

Die Probleme 5 und 6 machen einen Run nie rot. Man findet sie beim Lesen des Workflows, nicht im
Log.

## Zusätzlicher Fund

Der fehlerhafte Job `release` hätte auch nach den sechs Fixes nie funktioniert:

| Symptom                                                | Ursache                                                                                                    | Fix                                                                                                                                                                                                                                              |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `release` hat kein `build/app.zip`, und `gh` bricht ab | Kein `download-artifact`, deshalb fehlt das Paket. Kein Checkout, deshalb kennt `gh` das Repository nicht. | Das Artifact `app-paket` herunterladen ([`99e5ac2`](https://github.com/GitGitRice/pipeline-challenge/commit/99e5ac2)); `GH_REPO: ${{ github.repository }}` setzen ([`b31a8ee`](https://github.com/GitGitRice/pipeline-challenge/commit/b31a8ee)) |

## Secret-Prüfung

Der fehlerhafte Job `deploy` hat `${{ secrets.DEPLOY_TOKEN }}` ausgegeben. Die Logs der
fehlerhaften Runs zeigen `Deploy nach` und danach einen leeren String. Der Token ist ein
Environment-Secret von `production`, und ein Job ohne `environment:` kann ihn nicht lesen. Kein
Wert ist in ein Log gelangt.
