import * as dotenv from 'dotenv';
dotenv.config();

const API_BASE_URL = `http://localhost:${process.env.PORT ?? 3000}`;
const DEFAULT_USER_PASSWORD = 'P@ssword1234';
const PLACEHOLDER_ICON_BASE64 = '/9j/4AAQSkZJRgABAQEASABIAA';

const API_ROUTES = {
	LOGIN: '/auth/login',
	DEV_USER_CREATE: '/dev/user/create',
	DEV_USER_UPDATE_BY_ID: (userId: string) => `/dev/user/update/${userId}`,
	USER_ADD_SCORE: '/user/score/add',
	PROBLEM_CREATE: '/problem',
	PROBLEM_UPDATE_BY_ID: (problemId: string | number) =>
		`/problem/${problemId}`, // Allow number for ID
	// TEST_CASE_CREATE_FOR_PROBLEM: (problemId: string | number) => `/problem/${problemId}/test-case`, // Endpoint is 404 Not Found
	// According to your Swagger/OAS, test cases are part of CreateProblemDto and UpdateProblemDto
};

const USER_ROLES = {
	STAFF: 'staff',
	MEMBER: 'member',
};

const PROBLEM_TAGS = ['Basic I/O', 'If - else', 'Loop', 'Array', 'Pattern'];

interface ApiResponse {
	statusCode?: number;
	message?: string | string[];
	[key: string]: any;
}

interface LoginResponse extends ApiResponse {
	token: string;
	user?: { id: string; email: string; role: string };
}

interface UserResponse extends ApiResponse {
	id: string;
}

interface ProblemResponse extends ApiResponse {
	id: string | number; // Problem ID might be a number based on logs (e.g., "11")
}

// Define a basic structure for a TestCase based on UpdateProblemDto requirements
interface TestCaseDto {
	input: string;
	expectOutput: string; // OAS schema shows "expectOutput", not "expectedOutput" or "isHiddenTestcase"
	// isHidden?: boolean; // OAS schema for UpdateProblemDto does not show isHidden for testCases
}

async function callApi<T = ApiResponse>(
	route: string,
	data?: any,
	token?: string,
	method = 'POST',
): Promise<T> {
	try {
		const headers: HeadersInit = {};
		if (
			data &&
			(method === 'POST' || method === 'PATCH' || method === 'PUT')
		) {
			headers['Content-Type'] = 'application/json';
		}
		if (token) {
			headers['Authorization'] = `Bearer ${token}`;
		}

		const fetchOptions: RequestInit = {
			method,
			headers: headers,
		};

		if (
			data &&
			(method === 'POST' || method === 'PATCH' || method === 'PUT')
		) {
			fetchOptions.body = JSON.stringify(data);
		}

		const response = await fetch(`${API_BASE_URL}${route}`, fetchOptions);

		const contentType = response.headers.get('content-type');
		if (
			response.status === 204 ||
			!contentType ||
			!contentType.includes('application/json')
		) {
			if (!response.ok) {
				const errorText = await response.text();
				console.error(
					`API Error ${response.status} for ${method} ${route}: ${errorText} (No JSON Response)`,
				);
				throw new Error(
					`API Error: ${response.status} ${response.statusText} - ${errorText}`,
				);
			}
			return {} as T;
		}

		const responseData: T = await response.json();

		if (!response.ok) {
			let errorMessage = response.statusText;
			if (responseData && (responseData as ApiResponse).message) {
				const apiMessage = (responseData as ApiResponse).message;
				errorMessage = Array.isArray(apiMessage)
					? apiMessage.join(', ')
					: apiMessage;
			}
			console.error(
				`API Error for ${method} ${route}:`,
				errorMessage,
				responseData,
			);
			const error = new Error(
				`API call failed for ${route}: ${errorMessage}`,
			);
			(error as any).response = responseData;
			throw error;
		}
		return responseData;
	} catch (error: any) {
		console.error(`Error calling API ${method} ${route}:`, error.message);
		if (error.response) {
			console.error('API Response Data:', error.response);
		}
		throw error;
	}
}

async function loginUser(
	email: string,
	password = DEFAULT_USER_PASSWORD,
): Promise<LoginResponse> {
	console.log(`Attempting to log in user: ${email}`);
	const loginData = await callApi<LoginResponse>(API_ROUTES.LOGIN, {
		email,
		password,
	});
	console.log(`User ${email} logged in successfully.`);
	return loginData;
}

async function createAndInitializeUser(
	email: string,
	name: string,
	role: string,
	adminToken: string,
): Promise<string | undefined> {
	console.log(`Attempting to create user: ${email} with role: ${role}`);
	try {
		const createUserResponse = await callApi<UserResponse>(
			API_ROUTES.DEV_USER_CREATE,
			{
				email,
				password: DEFAULT_USER_PASSWORD,
				role,
				name,
			},
			adminToken,
		);
		console.log('Create user raw response:', createUserResponse);

		if (!createUserResponse || !createUserResponse.id) {
			console.error(
				`Failed to create user ${email} or ID missing in response.`,
			);
			if (
				createUserResponse?.statusCode === 400 &&
				(createUserResponse.message === 'User already exists' ||
					(Array.isArray(createUserResponse.message) &&
						createUserResponse.message.includes(
							'User already exists',
						)))
			) {
				console.log(
					`User ${email} already exists, skipping creation and update.`,
				);
				return undefined;
			}
			return undefined;
		}

		const userId = createUserResponse.id;
		console.log(`User ${email} created successfully with ID: ${userId}.`);

		const randomStudentId = Math.floor(
			10000000 + Math.random() * 90000000,
		).toString();

		console.log(`Updating profile for user ID: ${userId}`);
		await callApi(
			API_ROUTES.DEV_USER_UPDATE_BY_ID(userId),
			{
				name: email.split('@')[0],
				house: null,
				studentId: randomStudentId,
				icon: PLACEHOLDER_ICON_BASE64,
			},
			adminToken,
		);
		console.log(`Profile updated for user ID: ${userId}.`);
		return userId;
	} catch (error: any) {
		if (
			error.response?.statusCode === 400 &&
			(error.response.message === 'User already exists' ||
				(Array.isArray(error.response.message) &&
					error.response.message.includes(
						'User already exists',
					)))
		) {
			console.log(
				`User ${email} already exists (caught error), skipping creation and update.`,
			);
			return undefined;
		}
		console.error(
			`Error in createAndInitializeUser for ${email}:`,
			error.message,
		);
		return undefined;
	}
}

async function addUserScore(
	userId: string,
	amount: number,
	message: string,
	adminToken: string,
): Promise<void> {
	console.log(`Adding score ${amount} to user ID: ${userId}`);
	await callApi(
		API_ROUTES.USER_ADD_SCORE,
		{ userId, amount, message },
		adminToken,
	);
	console.log(`Score added for user ID: ${userId}.`);
}

async function createProblem(
	problemData: any,
	authorToken: string,
): Promise<ProblemResponse> {
	console.log(`Creating problem: ${problemData.title}`);
	const problem = await callApi<ProblemResponse>(
		API_ROUTES.PROBLEM_CREATE,
		problemData,
		authorToken,
	);
	console.log(
		`Problem "${problemData.title}" created with ID: ${problem.id}`,
	);
	return problem;
}

// This function is not used as the endpoint /problem/:id/test-case seems to be incorrect (404)
// Test cases are now part of the CreateProblemDto and UpdateProblemDto
/*
async function addTestCaseToProblem(
    problemId: string | number,
    input: string,
    expectOutput: string,
    isHidden: boolean,
    authorToken: string,
): Promise<void> {
    console.log(`Adding test case to problem ID: ${problemId}`);
    await callApi(
        API_ROUTES.TEST_CASE_CREATE_FOR_PROBLEM(problemId),
        { input, expectOutput, isHiddenTestcase: isHidden },
        authorToken,
    );
    console.log(`Test case added to problem ID: ${problemId}`);
}
*/

async function updateProblemDetails(
	problemId: string | number,
	updateData: any, // Should match UpdateProblemDto structure
	authorToken: string,
): Promise<void> {
	console.log(`Updating problem ID: ${problemId}`);
	await callApi(
		API_ROUTES.PROBLEM_UPDATE_BY_ID(problemId),
		updateData,
		authorToken,
		'PATCH',
	);
	console.log(`Problem ID: ${problemId} updated.`);
}

(async () => {
	try {
		console.log('--- Admin Login ---');
		const adminLoginData = await loginUser(
			process.env.ADMIN_EMAIL!,
			process.env.ADMIN_PASS!,
		);
		const adminToken = adminLoginData.token;

		console.log('\n--- Creating Staff Users ---');
		const staffUsersData = [
			{
				email: `staff-${Date.now()}-1@example.com`,
				name: `Staff One`,
			},
			{
				email: `staff-${Date.now()}-2@example.com`,
				name: `Staff Two`,
			},
		];
		const staffUserIds: string[] = [];

		for (const staff of staffUsersData) {
			const userId = await createAndInitializeUser(
				staff.email,
				staff.name,
				USER_ROLES.STAFF,
				adminToken,
			);
			if (userId) {
				staffUserIds.push(userId);
				await addUserScore(
					userId,
					Math.floor(Math.random() * 1000),
					`Initial score for ${staff.name}`,
					adminToken,
				);
			}
		}

		console.log('\n--- Creating Member Users ---');
		const memberUsersData = [
			{
				email: `member-${Date.now()}-1@example.com`,
				name: `Member One`,
			},
			{
				email: `member-${Date.now()}-2@example.com`,
				name: `Member Two`,
			},
		];

		for (const member of memberUsersData) {
			const userId = await createAndInitializeUser(
				member.email,
				member.name,
				USER_ROLES.MEMBER,
				adminToken,
			);
			if (userId) {
				await addUserScore(
					userId,
					Math.floor(Math.random() * 1000),
					`Initial score for ${member.name}`,
					adminToken,
				);
			}
		}

		console.log('\n--- Logging in Staff Users ---');
		let staff1Token: string | undefined, staff2Token: string | undefined;
		if (staffUserIds.length > 0 && staffUsersData[0]) {
			try {
				const staff1LoginData = await loginUser(
					staffUsersData[0].email,
				);
				staff1Token = staff1LoginData.token;
			} catch (e) {
				console.warn(
					`Could not log in staff 1 (${staffUsersData[0].email}), proceeding without their token. Error: ${(e as Error).message}`,
				);
			}
		}
		if (staffUserIds.length > 1 && staffUsersData[1]) {
			try {
				const staff2LoginData = await loginUser(
					staffUsersData[1].email,
				);
				staff2Token = staff2LoginData.token;
			} catch (e) {
				console.warn(
					`Could not log in staff 2 (${staffUsersData[1].email}), proceeding without their token. Error: ${(e as Error).message}`,
				);
			}
		}

		if (!staff1Token && !staff2Token) {
			console.warn(
				'Neither staff user could be logged in. Some subsequent operations might fail or use admin token.',
			);
		}

		console.log('\n--- Creating Problems ---');
		const createdProblems: ProblemResponse[] = []; // Store full problem response
		const numProblemsToCreate = 10;

		for (let i = 0; i < numProblemsToCreate; i++) {
			const randomTags = [];
			const numTags = Math.floor(Math.random() * 3);
			for (let j = 0; j < numTags; j++) {
				randomTags.push(
					PROBLEM_TAGS[
						Math.floor(Math.random() * PROBLEM_TAGS.length)
					],
				);
			}

			// Generate test cases for CreateProblemDto
			const testCasesForCreation: TestCaseDto[] = [];
			const numTestCases = Math.floor(Math.random() * 2) + 1; // 1 to 2 test cases
			for (let k = 1; k <= numTestCases; k++) {
				testCasesForCreation.push({
					input: `Input for T${k} of P_New${i + 1}`,
					expectOutput: `Expected Output for T${k} of P_New${i + 1}`,
					// isHidden: k > (numTestCases - 1), // isHidden not in CreateProblemDto.testCases based on UpdateProblemDto error
				});
			}

			const problemData = {
				title: `Generated Problem ${i + 1} ${Date.now()}`,
				description: `This is an auto-generated test problem #${i + 1}.`,
				difficulty: Math.floor(Math.random() * 5) + 1,
				tags: randomTags,
				defaultCode:
					'#include <stdio.h>\n\nint main() {\n\tprintf("Hello, World!");\n\treturn 0;\n}',
				solutionCode:
					'#include <stdio.h>\n\nint main() {\n\tprintf("Hello, World! Solution");\n\treturn 0;\n}',
				testCases: testCasesForCreation, // Include test cases in creation
			};

			let authorToken: string | undefined;
			if (i < numProblemsToCreate / 2) {
				authorToken = staff1Token;
			} else {
				authorToken = staff2Token;
			}

			if (!authorToken) {
				console.warn(
					`Skipping problem "${problemData.title}" creation as required staff token is unavailable.`,
				);
				continue;
			}

			try {
				const createdProblem = await createProblem(
					problemData,
					authorToken,
				);
				createdProblems.push(createdProblem);

				// No need to call addTestCaseToProblem separately if testCases are part of CreateProblemDto
			} catch (error) {
				console.error(
					`Failed to create problem "${problemData.title}": ${(error as Error).message}`,
				);
			}
		}

		console.log('\n--- Updating Problems ---');
		const numProblemsToUpdate = Math.min(3, createdProblems.length);
		for (let i = 0; i < numProblemsToUpdate; i++) {
			const problemToUpdate = createdProblems[i];
			if (!problemToUpdate || !problemToUpdate.id) {
				console.warn(
					`Skipping update for problem at index ${i} as it's invalid or has no ID.`,
				);
				continue;
			}

			let updaterToken: string | undefined;
			if (i < numProblemsToCreate / 2) {
				updaterToken = staff1Token;
			} else {
				updaterToken = staff2Token;
			}
			if (!updaterToken) updaterToken = staff1Token || staff2Token;

			if (!updaterToken) {
				console.warn(
					`Skipping update for problem ID ${problemToUpdate.id} as no staff token is available.`,
				);
				continue;
			}

			// Generate test cases for UpdateProblemDto
			const testCasesForUpdate: TestCaseDto[] = [];
			const numUpdateTestCases = Math.floor(Math.random() * 2) + 1; // 1 to 2 test cases
			for (let k = 1; k <= numUpdateTestCases; k++) {
				testCasesForUpdate.push({
					input: `Updated Input for T${k} of P_Update${problemToUpdate.id}`,
					expectOutput: `Updated Expected Output for T${k} of P_Update${problemToUpdate.id}`,
					// isHidden: k > (numUpdateTestCases - 1), // isHidden not in UpdateProblemDto.testCases
				});
			}

			try {
				const updatePayload = {
					title: `Updated - Problem Title ${problemToUpdate.id} ${Date.now()}`,
					description:
						"This problem's description has been updated by the seeding script.",
					// These fields are required by UpdateProblemDto based on the error message
					solutionCode: `#include <stdio.h>\n\nint main() {\n\tprintf("Updated Hello, World! Solution for ${problemToUpdate.id}");\n\treturn 0;\n}`,
					difficulty: Math.floor(Math.random() * 4) + 1, // Random 1-4
					testCases: testCasesForUpdate, // testCases must be an array
					// tags: problemToUpdate.tags || [], // Optional, include if you want to update or ensure they persist
				};
				await updateProblemDetails(
					problemToUpdate.id,
					updatePayload,
					updaterToken,
				);
			} catch (error) {
				console.error(
					`Failed to update problem ID ${problemToUpdate.id}: ${(error as Error).message}`,
				);
			}
		}

		console.log('\n--- Seeding Script Completed ---');
	} catch (e: any) {
		console.error('\n--- CRITICAL ERROR IN SEEDING SCRIPT ---');
		console.error(e.message);
		if (e.response) {
			console.error('Associated API Response:', e.response);
		}
	}
})();
