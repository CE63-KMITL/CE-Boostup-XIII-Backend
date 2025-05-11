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

const createUser = async (email: string, role: string, adminToken: string) => {
	const createUser = await callApi(
		'/dev/user/create',
		{
			email: email,
			password: 'P@ssword1234',
			role: role,
			name: 'test1',
		},
		adminToken,
	);
	const setData = await callApi(
		`/dev/user/update/${createUser.id}`,
		{ password: 'P@ssword1234' },
		adminToken,
	);

	console.log('set data', setData);
};

(async () => {
	try {
		let adminLoginData = await callApi('/auth/login', {
			email: process.env.ADMIN_EMAIL,
			password: process.env.ADMIN_PASS,
		});

		console.log('admin', adminLoginData);

		createUser('staff1@gmail.com', 'staff', adminLoginData.token);
		createUser('staff2@gmail.com', 'staff', adminLoginData.token);
		createUser('member1@gmail.com', 'member', adminLoginData.token);
		createUser('member2@gmail.com', 'member', adminLoginData.token);

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
				},
				i > 5 ? staff2.token : staff1.token,
			);
			console.log('problem', problem);
			problemsToPublish.push(problem.id);
		}

		for (let i = 1; i <= 6; i++) {
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
		}

		for (let i = 0; i < 3; i++) {
			const updateProblem = await callApi(
				`/problem/${i + 1}`,
				{ devStatus: 'Published' },
				adminLoginData.token,
				'PATCH',
			);
			console.log('updateProblem', updateProblem);
		}
	} catch (e) {
		console.log(e);
	}
})();
