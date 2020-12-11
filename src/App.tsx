import React, { useState } from 'react';
import './styles/App.scss';
//	Apollo client
import {
	ApolloClient,
	InMemoryCache,
	useSubscription,
	useMutation,
	gql,
	ApolloProvider,
} from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import {
	Button,
	InputGroup,
	Input,
	Container,
	Row,
	Col,
	Toast,
	ToastBody,
	ToastHeader,
} from 'reactstrap';

interface IMessage {
	id: number;
	user: string;
	content: string;
}

type MessagesProps = {
	crtUser: string;
};

//	sub
const wsLink = new WebSocketLink({
	uri: `ws://localhost:4000/`,
	options: {
		reconnect: true,
	},
});
//	client
const client = new ApolloClient({
	link: wsLink,
	uri: 'http://localhost:4000',
	cache: new InMemoryCache(),
});

const GET_MESSAGES = gql`
	subscription {
		messages {
			id
			user
			content
		}
	}
`;

const POST_MESSAGE = gql`
	mutation($user: String!, $content: String!) {
		postMessage(user: $user, content: $content)
	}
`;

const Messages = ({ crtUser }: MessagesProps): JSX.Element | null => {
	const { data } = useSubscription(GET_MESSAGES);

	if (!data) {
		return null;
	}
	return data.messages.map(({ id, user, content }: IMessage) => (
		<Toast
			className="msg-bubble"
			key={id}
			style={
				user === crtUser
					? { alignSelf: 'flex-end', backgroundColor: '#7BB32E' }
					: { alignSelf: 'start' }
			}
		>
			<ToastHeader style={user === crtUser ? { display: 'none' } : { display: 'flex' }}>
				{user}:
			</ToastHeader>
			<ToastBody>{content}</ToastBody>
		</Toast>
	));
};

const App: React.FC = () => {
	const [input, setInput] = useState({
		user: '',
		content: '',
	});

	const [postMessage] = useMutation(POST_MESSAGE);
	//	handle send msg
	const handleSend = () => {
		if (input.content.length > 0 && input.user.length > 0) {
			postMessage({ variables: input });
		}
		setInput({ ...input, content: '' });
	};

	return (
		<main className="app">
			<Container>
				<Row className="rounded">
					<Col className="msg-board p-3">
						<Messages crtUser={input.user || ''} />
					</Col>
				</Row>

				<Row>
					<Col className="my-4">
						<InputGroup>
							<Input
								name="sender"
								placeholder="Name"
								className="input-sender"
								value={input.user}
								onChange={(evt) => {
									setInput({ ...input, user: evt.target.value });
								}}
							/>
							<Input
								name="text"
								placeholder="Type something"
								className="input-text"
								value={input.content}
								onChange={(evt) => {
									setInput({ ...input, content: evt.target.value });
								}}
							/>
							<Button color="success" className="submit-btn" onClick={handleSend}>
								Send
							</Button>
						</InputGroup>
					</Col>
				</Row>
			</Container>
		</main>
	);
};

export default () => (
	<ApolloProvider client={client}>
		<App />
	</ApolloProvider>
);
