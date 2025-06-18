import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export class ApiService {
  constructor(token) {
    this.token = token;
    this.config = {
      headers: { Authorization: `Bearer ${token}` }
    };
  }

  async fetchTest(testId) {
    const response = await axios.get(`${API_BASE_URL}/tests/${testId}`, this.config);
    return response.data;
  }

  async compileAndRun(code, languageId, stdin = '') {
    const response = await axios.post(
      `${API_BASE_URL}/code/run`,
      { code, languageId: Number(languageId), stdin },
      this.config
    );
    return response.data;
  }

  async submitAllTestCases(questionId, code, languageId) {
    const response = await axios.post(
      `${API_BASE_URL}/questions/${questionId}/submit`,
      { code, languageId: Number(languageId) },
      this.config
    );
    return response.data;
  }

  async submitTest(questionId, code, languageId, testId) {
    const response = await axios.post(
      `${API_BASE_URL}/questions/${questionId}/submit-test`,
      { code, languageId: Number(languageId), testId },
      this.config
    );
    return response.data;
  }
}