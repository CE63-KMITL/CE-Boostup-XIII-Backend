import * as dotenv from 'dotenv';
dotenv.config();

async function callApi(
	route: string,
	data: any,
	token?: string,
	method = 'POST',
) {
	try {
		const headers: HeadersInit = {
			'Content-Type': 'application/json',
		};
		if (token) {
			headers['Authorization'] = `Bearer ${token}`;
		}

		const response = await fetch(
			`http://localhost:${process.env.PORT ?? 3000}${route}`,
			{
				method,
				headers: headers,
				body: JSON.stringify(data),
			},
		);

		return await response.json();
	} catch (error) {
		console.error(`Error calling API ${route}:`, error);
		throw error;
	}
}

const createUser = async (email: string, name: string, role: string, adminToken: string): Promise<string | void> => {
	const createUserResponse = await callApi( // Renamed variable to avoid conflict
		'/dev/user/create',
		{
			email: email,
			password: 'P@ssword1234',
			role: role,
			name: name,
		},
		adminToken,
	);
	console.log('Create user response:', createUserResponse); // Log the entire response object

	// Check if user already exists
	if (
		createUserResponse.statusCode === 400 &&
		createUserResponse.message === 'User already exists'
	) {
		console.log(`User ${email} already exists, skipping update.`);
		return; // Exit function for this user
	}

	const houses = [
		'barbarian',
		'sorceror',
		'rogue',
		'wizard',
		'bard',
		'paladin',
		'monk',
		'samurai',
		'ranger',
		'priest',
		'fighter',
		'warlock',
	];
	const randomHouse = houses[Math.floor(Math.random() * houses.length)];
	const randomStudentId = Math.floor(
		10000000 + Math.random() * 90000000,
	).toString(); // 8-digit student ID
	const placeholderIcon = '/9j/4AAQSkZJRgABAQEASABIAA'; // Placeholder Base64 icon

	const setData = await callApi(
		`/dev/user/update/${createUserResponse.id}`, // Accessing user ID from response
		{
			// Added user details for update
			name: email.split('@')[0], // Simple name from email
			house: randomHouse,
			studentId: randomStudentId,
			icon: placeholderIcon,
		},
		adminToken,
	);

	console.log('set data', setData);

	// Return the created user's ID
	return createUserResponse.id;
};


(async () => {
	try {
		let adminLoginData = await callApi('/auth/login', {
			email: process.env.ADMIN_EMAIL,
			password: process.env.ADMIN_PASS,
		});

		console.log('admin', adminLoginData);

		const staff1UserId = await createUser(`staff-${Date.now()}-1@gmail.com`, `Staff User ${Date.now()} 1`, 'staff', adminLoginData.token);
		if (staff1UserId) {
			const randomScore1 = Math.floor(Math.random() * 1000); // Random score between 0 and 999
			await callApi(
				'/user/score/add',
				{
					userId: staff1UserId,
					amount: randomScore1,
					message: 'Initial random score for staff 1',
				},
				adminLoginData.token,
			);
		}


		const staff2UserId = await createUser(`staff-${Date.now()}-2@gmail.com`, `Staff User ${Date.now()} 2`, 'staff', adminLoginData.token);
		if (staff2UserId) {
			const randomScore2 = Math.floor(Math.random() * 1000); // Random score between 0 and 999
			await callApi(
				'/user/score/add',
				{
					userId: staff2UserId,
					amount: randomScore2,
					message: 'Initial random score for staff 2',
				},
				adminLoginData.token,
			);
		}

		const member1UserId = await createUser(`member-${Date.now()}-1@gmail.com`, `Member User ${Date.now()} 1`, 'member', adminLoginData.token);
		if (member1UserId) {
			const randomScore3 = Math.floor(Math.random() * 1000); // Random score between 0 and 999
			await callApi(
				'/user/score/add',
				{
					userId: member1UserId,
					amount: randomScore3,
					message: 'Initial random score for member 1',
				},
				adminLoginData.token,
			);
		}

		const member2UserId = await createUser(`member-${Date.now()}-2@gmail.com`, `Member User ${Date.now()} 2`, 'member', adminLoginData.token);
		if (member2UserId) {
			const randomScore4 = Math.floor(Math.random() * 1000); // Random score between 0 and 999
			await callApi(
				'/user/score/add',
				{
					userId: member2UserId,
					amount: randomScore4,
					message: 'Initial random score for member 2',
				},
				adminLoginData.token,
			);
		}

		let staff1 = await callApi('/auth/login', {
			email: 'staff1@gmail.com',
			password: 'P@ssword1234',
		});

		let staff2 = await callApi('/auth/login', {
			email: 'staff2@gmail.com',
			password: 'P@ssword1234',
		});

		console.log('staff', staff1, staff2);

		const tags = ['Basic I/O', 'If - else', 'Loop', 'Array', 'Pattern'];
		let problems = [];
		for (let i = 1; i <= 10; i++) {
			const randomTags = [];
			for (let j = 0; j < Math.floor(Math.random() * 3); j++) {
				randomTags.push(
					tags[Math.floor(Math.random() * tags.length)],
				);
			}
			problems.push({
				title: `test${i} ${Date.now()}`,
				description: 'test',
				difficulty: Math.floor(Math.random() * 5) + 1,
				tags: randomTags,
				defaultCode:
					'#include <stdio.h>\n\nint main() {\n\tprintf("Hello, World!");\n\treturn 0;\n}',
				solutionCode:
					'#include <stdio.h>\n\nint main() {\n\tprintf("Hello, World!");\n\treturn 0;\n}',
			});
		}

		const problemsToPublish = [];
		for (let i = 0; i < 10; i++) {
			let problem = await callApi(
				'/problem',
				{
					title: problems[i].title,
					description: problems[i].description,
					difficulty: problems[i].difficulty,
					tags: problems[i].tags,
					defaultCode: problems[i].defaultCode,
					solutionCode: problems[i].solutionCode,
					testCases: [], // Added testCases field
				},
				i > 5 ? staff2.token : staff1.token,
			);
			console.log('problem', problem);
			problemsToPublish.push(problem.id);
		}

		for (let i = 1; i <= 6; i++) {
			// Commented out as /test-case/1 endpoint does not exist
			/*
			const testcase = await callApi(
				`/test-case/1`,
				{
					input: i.toString(),
					expectOutput: i.toString(),
					isHiddenTestcase: i >= 3 ? true : false,
				},
				staff1.token,
			);
			console.log(testcase);
			*/
		}

		for (let i = 0; i < 3; i++) {
			const updateProblem = await callApi(
				`/problem/${i + 1}`,
				// Removed devStatus as it's not allowed in UpdateProblemDto
				{
					// Included required fields for update
					title: problems[i].title,
					solutionCode: problems[i].solutionCode,
					testCases: [], // Added testCases field
				},
				staff1.token, // Changed to staff1.token as staff1 is the owner of problems 1-3
				'PATCH',
			);
			console.log('updateProblem', updateProblem);
		}
	} catch (e) {
		console.log(e);
	}
})();
