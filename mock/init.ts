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

(async () => {
	try {
		let adminLoginData = await callApi('/auth/login', {
			email: process.env.ADMIN_EMAIL,
			password: process.env.ADMIN_PASS,
		});

		console.log('admin', adminLoginData);

		let newUserEmail = `test1@example.com`;
		let createUser = await callApi(
			'/dev/user/create',
			{
				email: newUserEmail,
				password: 'password',
				role: 'staff',
				name: 'test1',
			},
			adminLoginData.token,
		);

		console.log('create-user', createUser);

		let user = await callApi('/auth/login', {
			email: newUserEmail,
			password: 'password',
		});

		console.log('user', user);

		let setData = await callApi(
			`/dev/user/update/${user.user.id}`,
			{},
			adminLoginData.token,
			'POST',
		);

		console.log('setData', setData);

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
				title: `test${Date.now()}${Math.random()}`,
				description: 'test',
				difficulty: Math.floor(Math.random() * 5) + 1,
				tags: randomTags,
				defaultCode:
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
				},
				user.token,
			);
			console.log('problem', problem);
			problemsToPublish.push(problem.id);
		}

		for (let i = 0; i < 3; i++) {
			const problemId = problemsToPublish[i];
			const updateProblem = await callApi(
				`/problem/${problemId}`,
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
