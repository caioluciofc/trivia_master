import axios from 'axios';

interface QuestionJson {
  type: string;
  difficulty: string;
  category: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

interface OpenTriviaResponse {
  response_code: number;
  results: QuestionJson[];
}

interface TokenRequestResponse {
  reponse_code: number;
  response_message: string;
  token: string;
}

export class OpenTrivia {
  url = 'https://opentdb.com/';
  apiURL = this.url + 'api.php?';
  tokenURL = this.url + 'api_token.php?';

  async fetchQuestions(amount: number, token: string): Promise<QuestionJson[]> {
    return await axios
      .get<OpenTriviaResponse>(`${this.apiURL}amount=${amount}&token=${token}`)
      .then((response) => {
        return response.data.results;
      })
      .catch((error) => {
        console.error(error);
        return [];
      });
  }

  async retrieveToken(): Promise<string | null> {
    return await axios
      .get<TokenRequestResponse>(`${this.tokenURL}command=request`)
      .then((response) => {
        return response.data.token;
      })
      .catch((error) => {
        console.error(error);
        return null;
      });
  }
}
