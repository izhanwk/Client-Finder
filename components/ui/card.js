import React from "react";

const Card = React.forwardRef(function Card({ className = "", ...props }, ref) {
	return (
		<div
			ref={ref}
			className={`rounded-2xl border border-gray-700/50 bg-gray-800/40 ${className}`}
			{...props}
		/>
	);
});

function CardHeader({ className = "", ...props }) {
	return <div className={`p-6 ${className}`} {...props} />;
}

function CardContent({ className = "", ...props }) {
	return <div className={`p-6 pt-0 ${className}`} {...props} />;
}

function CardTitle({ className = "", ...props }) {
	return (
		<h3
			className={`font-semibold leading-none tracking-tight ${className}`}
			{...props}
		/>
	);
}

function CardDescription({ className = "", ...props }) {
	return <p className={`text-sm text-gray-400 ${className}`} {...props} />;
}

export { Card, CardHeader, CardContent, CardTitle, CardDescription };



